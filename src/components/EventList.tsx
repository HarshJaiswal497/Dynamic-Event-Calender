"use client";
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EventList = ({ events, day, onDeleteEvent }) => {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Events on {format(day, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.map((event) => (
          <div 
            key={event.id} // Use unique `id` instead of `index` as key
            className="border-b py-2 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{event.name}</h3>
              <p className="text-sm text-gray-600">
                {event.startTime} - {event.endTime}
              </p>
              {event.description && (
                <p className="text-sm text-gray-500">{event.description}</p>
              )}
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDeleteEvent(day, event)} // Pass both `day` and `event`
            >
              Delete
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EventList;
