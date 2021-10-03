import React, { useState, useRef, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"

import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import timeGridPlugin from "@fullcalendar/timegrid"

import EventDetails from "./eventDetails"
import { Box, useToast, useDisclosure } from "@chakra-ui/react"
import CreateEventPopUp from "./createEventPopUp"
import CreateEventButton from "./createEventButton"

import {
  createNewInteraction,
  getInteractionsByOrg,
  updateInteraction,
  getInteraction,
} from "../../models/Interaction"

import { getContact, getContactsByOrg } from "../../models/Contact"

import { getTasksByOrg } from "../../models/Task"

import { getDealsByOrg } from "../../models/Deal"

import InteractionPopUp from "../interactions/interactionPopup"

/**
 *
 * @property {Object} user User object
 * @property {Object} org Organization object
 * @returns
 */
const CalendarComponent = ({ user, org }) => {
  const calendarRef = useRef(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure()
  const [date, setDate] = useState(new Date())
  const [editDoc, setEditDoc] = useState(null)

  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Fetch contacts for autocomplete
    const fetchContacts = async orgID => {
      const contactList = await getContactsByOrg(orgID)
      for (const contact of contactList) contact.label = contact.name
      setContacts(contactList)
    }
    // Fetch deals to autocomplete
    const fetchDeals = async orgID => {
      const dealList = await getDealsByOrg(orgID)
      for (const deal of dealList) deal.label = deal.name
      setDeals(dealList)
    }

    // Fetch tasks to autocomplete
    const fetchTasks = async orgID => {
      const taskList = await getTasksByOrg(orgID)
      for (const task of taskList) task.label = task.name
      setTasks(taskList)
    }

    fetchContacts(org.id)
    fetchDeals(org.id)
    fetchTasks(org.id)
    clearEvents()
    loadEvents()
  }, [])

  // Add event from firestore document
  const addEvent = async doc => {
    let calendarApi = calendarRef.current.getApi()
    const contact = await getContact(doc.contact)
    calendarApi.addEvent({
      id: doc.id,
      title: doc?.name ? doc.name : "Meeting with " + contact.name,
      start: doc.meetingStart.toDate(),
      end: doc.meetingEnd == null ? null : doc.meetingEnd.toDate(),
      allDay: doc.meetingEnd == null ? true : false,
    })
  }

  // Load the events for this user
  const loadEvents = async () => {
    // Fetch all data from firestore
    const interactions = await getInteractionsByOrg(org.id)
    console.log(interactions)
    const events = interactions.filter(doc => {
      // non remindMe interactions
      return doc.remindMe
    })

    // Add every interactions meeting into calendar
    events.forEach(doc => addEvent(doc))
  }

  // Clear all events currently rendered in the calendar
  const clearEvents = () => {
    let calendarApi = calendarRef.current.getApi()
    calendarApi.getEvents().forEach(event => {
      event.remove()
    })
  }

  // Handle when a date is selected, in this case we want to add an event
  const handleDateSelected = selectInfo => {
    setDate(selectInfo.date)
    onOpen()
  }

  // Handle when date is selected, which creates a new event
  const createNewEventDate = (
    title,
    startDate,
    startTime,
    endTime,
    isAllDay,
    contactID = "",
    dealID = "",
    taskID = "",
    type = "",
    notes = ""
  ) => {
    // Parse time into date
    let start = new Date(startDate)
    const startTimeFormat = startTime.split(":").map(x => parseInt(x))
    start.setHours(startTimeFormat[0], startTimeFormat[1], 0, 0)

    // Process end if it exists
    let end = null
    if (endTime && !isAllDay) {
      end = new Date(startDate)
      const endTimeFormat = endTime.split(":").map(x => parseInt(x))
      end.setHours(endTimeFormat[0], endTimeFormat[1], 0, 0)
    }

    // Add interaction document to database
    createNewInteraction(
      org.id,
      contactID,
      user.id,
      dealID,
      start,
      type,
      notes,
      taskID,
      true,
      title,
      end,
      [user.id]
    ).then(docID => {
      // Create new event object in API
      let calendarApi = calendarRef.current.getApi()
      calendarApi.addEvent({
        id: docID,
        title: title,
        start: start,
        end: end,
        allDay: isAllDay,
      })
      toast({
        title: "Interaction Successfully Added",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    })
  }

  // Modifies the content of the event component
  const renderEventContent = eventInfo => {
    return (
      <>
        <EventDetails
          eventInfo={eventInfo}
          deleteEvent={() => {
            eventInfo.event.remove()
            updateInteraction(eventInfo.event.id, { remindMe: false })
          }}
          editEvent={() => {
            handleEdit(eventInfo.event.id)
          }}
        />
      </>
    )
  }

  // Update the event changes in database
  const updateEvent = async changeInfo => {
    await updateInteraction(changeInfo.event.id, {
      meetingStart: changeInfo.event.start,
      meetingEnd: changeInfo.event.end,
    })
  }

  // Handle when edit pop up is requested
  const handleEdit = async id => {
    getInteraction(id).then(doc => {
      setEditDoc(doc)
      onOpenEdit()
    })
  }

  return (
    <>
      <Box pt="10px" borderBottom="10px">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          dateClick={handleDateSelected}
          editable={true}
          aspectRatio={2.5}
          eventContent={renderEventContent}
          eventChange={updateEvent}
          eventColor="rgba(0,0,0,0)"
          eventTextColor="white"
        />
      </Box>
      <CreateEventPopUp
        createEventObject={createNewEventDate}
        isOpen={isOpen}
        onClose={onClose}
        date={date}
        setDate={setDate}
        contacts={contacts}
        deals={deals}
        tasks={tasks}
      />
      <Box pt="20px" pb="20px" align="end">
        <CreateEventButton onOpen={onOpen} />
      </Box>
      <InteractionPopUp
        isOpen={isOpenEdit}
        onClose={onCloseEdit}
        value={editDoc}
        afterUpdate={async () => {
          let calendarApi = calendarRef.current.getApi()
          calendarApi.getEventById(editDoc.id).remove()
          const doc = await getInteraction(editDoc.id)
          console.log(doc)
          addEvent(doc)
        }}
        t
      />
    </>
  )
}

export default CalendarComponent
