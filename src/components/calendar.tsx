import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';
import { db, auth } from '../firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  const [user, setUser] = useState<any>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [swipedEvent, setSwipedEvent] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchEvents(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
      document.removeEventListener('click', handleClickOutside);
    };
  }, [editingEventId]);

  const fetchEvents = async (userId: string) => {
    try {
      const q = query(collection(db, "users", userId, "events"));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Event, 'id'>;
        return {
          id: doc.id,
          ...data
        };
      });
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events: ', error);
    }
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (offset: number) => {
    const newMonth = currentMonth + offset;
    if (newMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else if (newMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleEventSubmit = async () => {
    if (!user) {
      alert('User is not authenticated');
      return;
    }

    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      alert('Please fill in the title, start time, and end time');
      return;
    }

    const firestoreEvent = {
      title: newEvent.title,
      date: selectedDate ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : '',
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      description: newEvent.description,
    };

    try {
      if (eventToEdit) {
        await updateDoc(doc(db, "users", user.uid, "events", eventToEdit.id), firestoreEvent);
        setEvents(events.map((event) => (event.id === eventToEdit.id ? { ...firestoreEvent, id: eventToEdit.id } : event)));
      } else {
        const docRef = await addDoc(collection(db, "users", user.uid, "events"), firestoreEvent);
        setEvents([...events, { ...firestoreEvent, id: docRef.id }]);
      }
      setShowModal(false);
      setNewEvent({
        id: '',
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
      });
    } catch (error) {
      console.error('Error saving event: ', error);
      alert('Failed to save event');
    }
  };

  const handleEventEdit = (event: Event) => {
    setEventToEdit(event);
    setNewEvent(event);
    setShowModal(true);
  };

  const handleEventDelete = async (eventId: string) => {
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "events", eventId));
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event: ', error);
      alert('Failed to delete event');
    }
  };

  const handleEventDoubleClick = (event: React.MouseEvent, eventId: string) => {
    event.stopPropagation();  // イベントの伝播を止める
    setEditingEventId(editingEventId === eventId ? null : eventId);
  };

  const handleSwipe = (event: React.TouchEvent, eventId: string) => {
    const touch = event.changedTouches[0];
    if (touch.clientX < window.innerWidth / 2) {
      setSwipedEvent(eventId);
    } else {
      setSwipedEvent(null);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.event-item') && editingEventId) {
      setEditingEventId(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-start justify-start" style={{ height: `${viewportHeight - 120}px`, backgroundColor: '#F9ECCB' }}>
      <div className="header w-full shadow-md rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between p-4" style={{ backgroundColor: '#1a237e' }}>
          <button className="text-gray-500" onClick={() => handleMonthChange(-1)}>&lt;</button>
          <h2 className="text-lg font-bold text-white cursor-pointer">{`${currentYear}年${currentMonth + 1}月`}</h2>
          <button className="text-gray-500" onClick={() => handleMonthChange(1)}>&gt;</button>
        </div>
        <div className="grid grid-cols-7 text-center border-t border-b bg-white">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <div key={index} className="py-2 text-sm text-gray-700">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center bg-white">
          {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, index) => (
            <div key={index} className="py-2"></div>
          ))}
          {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, dateIndex) => {
            const date = dateIndex + 1;
            const hasEvent = events.some((event) => new Date(event.date).getDate() === date && new Date(event.date).getMonth() === currentMonth && new Date(event.date).getFullYear() === currentYear);
            const isToday = date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            return (
              <div
                key={dateIndex}
                className={`py-2 relative cursor-pointer ${date === selectedDate ? 'bg-blue-500 text-white' : 'text-gray-900'} ${isToday && date !== selectedDate ? 'text-red-500' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date}
                {hasEvent && <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 bg-red-500 rounded-full"></span>}
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t overflow-y-auto bg-white" style={{ height: `${viewportHeight-440}px` }}>
          <p>{selectedDate ? `${currentMonth + 1}月${selectedDate}日` : ''}</p>
          {events.filter(event => new Date(event.date).getDate() === selectedDate && new Date(event.date).getMonth() === currentMonth && new Date(event.date).getFullYear() === currentYear)
            .sort((a, b) => {
              const aStartTime = a.startTime || '';
              const bStartTime = b.startTime || '';
              return aStartTime.localeCompare(bStartTime);
            })
            .map((event, index) => (
              <div
                key={index}
                id={event.id}
                className={`relative flex items-center p-2 bg-gray-100 rounded mb-2 cursor-pointer transition-transform event-item`}
                onDoubleClick={(e) => handleEventDoubleClick(e, event.id)}
                onTouchEnd={(e) => handleSwipe(e, event.id)}
              >
                <div className="flex-grow">
                  <p>{`${event.startTime} - ${event.endTime}`}</p>
                  <p>{event.title}</p>
                  <p>{event.description}</p>
                </div>
                {editingEventId === event.id && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEventEdit(event)}
                    >
                      <PencilIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleEventDelete(event.id)}
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          {selectedDate && (
            <button
            className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-500 fixed bottom-24 left-1/2 transform -translate-x-1/2" // ここを変更しました
            onClick={() => {
              setEventToEdit(null);
              setNewEvent({
                id: '',
                title: '',
                date: '',
                startTime: '',
                endTime: '',
                description: '',
              });
              setShowModal(true);
            }}
          >
            <PlusIcon className="h-8 w-8" aria-hidden="true" />
          </button>
          )}
        </div>

        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setShowModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>
            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6 w-full">
                    <div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                          {eventToEdit ? 'Edit Event' : 'Add Event'}
                        </Dialog.Title>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="title"
                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                            value={newEvent.title}
                            onChange={handleEventChange}
                            placeholder="Title"
                          />
                          <div className="mt-4 flex flex-col items-center">
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">開始時刻</label>
                            <input
                              type="time"
                              name="startTime"
                              className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 mt-1"
                              value={newEvent.startTime}
                              onChange={handleEventChange}
                              placeholder="Start Time"
                            />
                          </div>
                          <div className="mt-4 flex flex-col items-center">
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">終了時刻</label>
                            <input
                              type="time"
                              name="endTime"
                              className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 mt-1"
                              value={newEvent.endTime}
                              onChange={handleEventChange}
                              placeholder="End Time"
                            />
                          </div>
                          <textarea
                            name="description"
                            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 mt-4"
                            value={newEvent.description}
                            onChange={handleEventChange}
                            placeholder="Description"
                          />
                        </div>
                        <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            onClick={handleEventSubmit}
                            disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime}
                          >
                            {eventToEdit ? 'Update' : 'Create'}
                          </button>
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-base font-semibold text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={() => setShowModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  );
};

export default Calendar;
