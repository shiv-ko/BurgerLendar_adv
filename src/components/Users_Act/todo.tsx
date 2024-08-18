import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { db, auth } from '../../firebase/firebase'; // Adjust the import based on your file structure
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, writeBatch } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { CSSProperties } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EventIcon from '@mui/icons-material/Event';
import useViewportHeight from "../../hooks/useViewportHeight"; // Import the custom hook

interface Item {
  id: string;
  text: string;
  dueDate: string;
}

const ToDo: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const viewportHeight = useViewportHeight(); // Use custom hook

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchItems(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchItems = async (userId: string) => {
    try {
      const q = query(collection(db, "Users_Act", userId, "todos"));
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items: ', error);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    if (newDueDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);

      if (newDueDate.getTime() < today.getTime() && newDueDate.getTime() < tomorrow.getTime()) {
        setErrorMessage('The due date cannot be in the past.');
        return;
      }

      try {
        await addDoc(collection(db, "Users_Act", user.uid, "todos"), {
          text: newItem,
          dueDate: formatDate(newDueDate),
        });
        setNewItem('');
        setNewDueDate(null);
        setErrorMessage('');
        fetchItems(user.uid);
      } catch (error) {
        console.error('Error adding item: ', error);
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) {
      alert('User is not authenticated');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "Users_Act", user.uid, "todos", itemId));
        fetchItems(user.uid);
      } catch (error) {
        console.error('Error deleting item: ', error);
      }
    }
  };

  const handleUpdateItems = async () => {
    if (!user) {
      alert('User is not authenticated');
      return;
    }
    try {
      const batch = writeBatch(db);
      items.forEach(item => {
        const itemRef = doc(db, "Users_Act", user.uid, "todos", item.id);
        batch.update(itemRef, {
          text: item.text,
          dueDate: item.dueDate,
        });
      });
      await batch.commit();
      setIsEditMode(false);
      fetchItems(user.uid);
    } catch (error) {
      console.error('Error updating items: ', error);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      handleUpdateItems();
    } else {
      setIsEditMode(true);
    }
  };

  const getDueDateStyle = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysLeft <= 0) {
      return { color: 'red' };
    } else if (daysLeft <= 3) {
      return { color: 'red' };
    } else if (daysLeft <= 10) {
      return { color: 'orange' };
    } else {
      return { color: 'black' };
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: `${viewportHeight - 120}px`,
      backgroundColor: '#F9ECCB',
      color: '#000',
      padding: '20px',
    } as CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between', // Ensure items are spread out
      width: '100%',
    } as CSSProperties,
    title: {
      fontSize: '2.5em',
      color: '#003366',
      fontWeight: 'bold',
    } as CSSProperties,
    addContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      marginTop: '10px',
    } as CSSProperties,
    editButton: {
      padding: '10px 20px',
      width: '80px',
      backgroundColor: '#003366',
      color: '#F9ECCB',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    } as CSSProperties,
    editButtonDisabled: {
      backgroundColor: '#A9A9A9',
      cursor: 'not-allowed',
    } as CSSProperties,
    list: {
      listStyleType: 'none' as const,
      padding: '0',
      maxWidth: '100%',
      overflowY: 'scroll' as const,
      maxHeight: `${viewportHeight - 200}px`,
      marginTop: '10px',
      width: '100%',
    } as CSSProperties,
    listItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #ddd',
      width: '100%',
      fontWeight: 'bold',
    } as CSSProperties,
    input: {
      flex: '1',
      width: '150px',
      padding: '5px',
      border: '1px solid #ddd',
      borderRadius: '5px',
    } as CSSProperties,
    datePickerContainer: {
      marginLeft: '10px',
      width: '30px',
    } as CSSProperties,
    calendarIcon: {
      fontSize: '1.5em',
      cursor: 'pointer',
    } as CSSProperties,
    addButton: {
      marginLeft: '10px',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#003366',
      color: '#F9ECCB',
      cursor: 'pointer',
    } as CSSProperties,
    addButtonDisabled: {
      backgroundColor: '#A9A9A9',
      cursor: 'not-allowed',
    } as CSSProperties,
    removeButton: {
      marginLeft: '10px',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#CC3333',
      color: 'white',
      cursor: 'pointer',
    } as CSSProperties,
    dueDate: {
      marginLeft: '10px',
      textAlign: 'right',
      flex: '1',
    } as CSSProperties,
    errorMessage: {
      color: 'red',
      marginTop: '10px',
    } as CSSProperties,
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>To do list</h1>
        <button
          onClick={toggleEditMode}
          style={{
            ...styles.editButton,
            ...(newItem.trim() !== '' && newDueDate !== null ? styles.editButtonDisabled : {}),
          }}
          disabled={newItem.trim() !== '' && newDueDate !== null}
        >
          {isEditMode ? 'Save' : 'Edit'}
        </button>
      </div>
      <form onSubmit={handleAddItem} style={styles.addContainer}>
        <input
          type="text"
          value={newItem}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItem(e.target.value)}
          placeholder="+Add..."
          style={styles.input}
          required
        />
        <div style={styles.datePickerContainer}>
          <DatePicker
            selected={newDueDate}
            onChange={(date: Date) => setNewDueDate(date)}
            customInput={<EventIcon style={styles.calendarIcon} />}
            popperClassName="date-picker-popper"
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.addButton,
            ...(newItem.trim() === '' || newDueDate === null ? styles.addButtonDisabled : {}),
          }}
          disabled={newItem.trim() === '' || newDueDate === null}
        >
          Add
        </button>
      </form>
      {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
      <ul style={styles.list}>
        {items
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .map((item, index) => (
            <li key={index} style={styles.listItem}>
              {isEditMode ? (
                <>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const updatedItems = items.map(it =>
                        it.id === item.id ? { ...it, text: e.target.value } : it
                      );
                      setItems(updatedItems);
                    }}
                    style={styles.input}
                  />
                  <div style={styles.datePickerContainer}>
                    <DatePicker
                      selected={new Date(item.dueDate)}
                      onChange={(date: Date) => {
                        const updatedItems = items.map(it =>
                          it.id === item.id ? { ...it, dueDate: formatDate(date) } : it
                        );
                        setItems(updatedItems);
                      }}
                      customInput={<EventIcon style={styles.calendarIcon} />}
                      popperClassName="date-picker-popper"
                    />
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} style={styles.removeButton}>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <span>{item.text}</span>
                  {item.dueDate && (
                    <span style={{ ...styles.dueDate, ...getDueDateStyle(item.dueDate) }}>
                      {item.dueDate}
                    </span>
                  )}
                </>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ToDo;
