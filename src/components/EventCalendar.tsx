"use client"; // Add this line at the top

import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameMonth,
} from "date-fns";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EventModal from "@/components/EventModal";
import EventList from "@/components/EventList";
import { exportToCSV, exportToJSON } from "@/utils/exportUtils";

// Define types for events
type EventDetails = {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  color?: keyof typeof EVENT_COLORS;
};

type EventsState = Record<string, EventDetails[]>; // Key is the date (yyyy-MM-dd)

const EVENT_COLORS = {
  work: "bg-blue-200",
  personal: "bg-green-200",
  other: "bg-yellow-200",
};

const EventCalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<EventsState>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

  // Load events from localStorage on initial render
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  // Generate calendar days for the current month
  const generateCalendarDays = (): Date[] => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  // Add a new event with color
  const addEvent = (day: Date, eventDetails: Omit<EventDetails, "id">) => {
    const dayKey = format(day, "yyyy-MM-dd");

    // Check for time conflicts
    const existingEvents = events[dayKey] || [];
    const hasConflict = existingEvents.some(
      (existingEvent) =>
        (eventDetails.startTime >= existingEvent.startTime &&
          eventDetails.startTime < existingEvent.endTime) ||
        (eventDetails.endTime > existingEvent.startTime &&
          eventDetails.endTime <= existingEvent.endTime)
    );

    if (hasConflict) {
      alert("This event conflicts with an existing event. Please choose a different time.");
      return;
    }

    const newEvents = {
      ...events,
      [dayKey]: [...existingEvents, { ...eventDetails, id: Date.now().toString() }],
    };
    setEvents(newEvents);
  };

  // Delete an event
  const deleteEvent = (day: Date, eventToDelete: EventDetails) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const updatedEvents = {
      ...events,
      [dayKey]: events[dayKey].filter((event) => event.id !== eventToDelete.id),
    };
    setEvents(updatedEvents);
  };

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceDate = format(new Date(source.droppableId), "yyyy-MM-dd");
    const destDate = format(new Date(destination.droppableId), "yyyy-MM-dd");

    // Remove event from source day
    const sourceEvents = [...(events[sourceDate] || [])];
    const [movedEvent] = sourceEvents.splice(source.index, 1);

    // Add event to destination day
    const destEvents = [...(events[destDate] || [])];
    destEvents.splice(destination.index, 0, movedEvent);

    // Update events state
    setEvents({
      ...events,
      [sourceDate]: sourceEvents,
      [destDate]: destEvents,
    });
  };

  // Export events
  const handleExport = () => {
    const monthEvents = Object.keys(events)
      .filter((key) => {
        const eventDate = new Date(key);
        return (
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce<EventsState>((acc, key) => {
        acc[key] = events[key];
        return acc;
      }, {});

    if (exportFormat === "json") {
      exportToJSON(monthEvents, `events_${format(currentDate, "MMMM_yyyy")}.json`);
    } else {
      // Flatten events for CSV
      const flatEvents = Object.entries(monthEvents).flatMap(([date, dayEvents]) =>
        dayEvents.map((event) => ({
          date,
          ...event,
        }))
      );
      exportToCSV(flatEvents, `events_${format(currentDate, "MMMM_yyyy")}.csv`);
    }
  };

  // Filter events
  const filterEvents = (events: EventDetails[]): EventDetails[] => {
    if (!filterKeyword) return events;
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(filterKeyword.toLowerCase()))
    );
  };

  // Render the calendar grid
  const renderCalendarGrid = () => {
    const days = generateCalendarDays();
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-7 gap-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="font-bold">
              {day}
            </div>
          ))}
          {days.map((day) => (
            <Droppable droppableId={day.toISOString()} key={day.toISOString()}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-2 border rounded min-h-[100px] ${
                    !isSameMonth(day, currentDate) ? "text-gray-300" : ""
                  } ${isToday(day) ? "bg-blue-100" : ""} ${
                    selectedDay &&
                    format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                      ? "border-blue-500"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedDay(day);
                    setIsEventModalOpen(true);
                  }}
                >
                  {format(day, "d")}
                  {events[format(day, "yyyy-MM-dd")] && (
                    <>
                      {filterEvents(events[format(day, "yyyy-MM-dd")]).map((event, index) => (
                        <Draggable key={event.id} draggableId={event.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mt-1 p-1 text-xs rounded ${
                                EVENT_COLORS[event.color || "other"]
                              }`}
                            >
                              {event.name}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <Button onClick={() => setCurrentDate((prev) => new Date(prev.setMonth(prev.getMonth() - 1)))}>
              Previous
            </Button>
            <h2>{format(currentDate, "MMMM yyyy")}</h2>
            <Button onClick={() => setCurrentDate((prev) => new Date(prev.setMonth(prev.getMonth() + 1)))}>
              Next
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4 space-x-4">
            <Input
              placeholder="Filter events..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              className="flex-grow"
            />
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Export Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">Export as JSON</SelectItem>
                <SelectItem value="csv">Export as CSV</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>Export</Button>
          </div>
          {renderCalendarGrid()}
        </CardContent>
      </Card>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        day={selectedDay}
        onAddEvent={addEvent}
      />
      {selectedDay && events[format(selectedDay, "yyyy-MM-dd")] && (
        <EventList
          events={filterEvents(events[format(selectedDay, "yyyy-MM-dd")])}
          day={selectedDay}
          onDeleteEvent={deleteEvent}
        />
      )}
    </div>
  );
};

export default EventCalendarApp;
