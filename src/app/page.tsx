// src/app/page.tsx
"use client";
import EventCalendar from '@/components/EventCalendar'; // Adjust path if needed
import EventModal from '@/components/EventModal'; // Adjust path if needed

export default function Home() {
  return (
    <div className="container">
      <h1>Welcome to the Dynamic Event Calendar!</h1>
      <EventCalendar /> {/* Your calendar component */}
      <EventModal isOpen={false} onClose={() => {}} day={new Date()} onAddEvent={() => {}} /> {/* Modal Example */}
    </div>
  );
}
