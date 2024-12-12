"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const EVENT_COLORS = {
  work: 'Blue (Work)',
  personal: 'Green (Personal)',
  other: 'Yellow (Other)'
};

const EventModal = ({ isOpen, onClose, day, onAddEvent }) => {
  const [eventName, setEventName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('other');

  const handleSubmit = () => {
    // Basic validation
    if (!eventName || !startTime || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate time
    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }

    // Create event object
    const newEvent = {
      name: eventName,
      startTime,
      endTime,
      description,
      color
    };

    onAddEvent(day, newEvent);
    
    // Reset form
    setEventName('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setColor('other');
    onClose();
  };

  if (!isOpen || !day) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event for {format(day, 'MMMM d, yyyy')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="eventName" className="text-right">
              Event Name
            </Label>
            <Input 
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="col-span-3"
              placeholder="Enter event name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input 
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input 
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional event description"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Event Color
            </Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select event color" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_COLORS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;