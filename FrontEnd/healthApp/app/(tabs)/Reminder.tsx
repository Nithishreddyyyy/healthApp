import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Appearance,
  useColorScheme
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

// Type definitions
type Reminder = {
  id: number;
  title: string;
  description?: string;
  time: string;
  date: string;
  dateObj: Date;
  checked: boolean;
};

type IconProps = {
  width: number;
  height: number;
  color: string;
};

type AddTaskScreenProps = {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: Reminder) => void;
  darkMode: boolean;
};

type ReminderItemProps = {
  item: Reminder;
  onToggleComplete: (id: number) => void;
  darkMode: boolean;
};

// Icon Components
const BellIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z" />
  </Svg>
);

const CalendarIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z" />
  </Svg>
);

const CaretLeft: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
  </Svg>
);

const CaretRight: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
  </Svg>
);

const ClockIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
  </Svg>
);

const PlusIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
  </Svg>
);

const CheckIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
  </Svg>
);

const SunIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" />
  </Svg>
);

const MoonIcon: React.FC<IconProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} fill={color} viewBox="0 0 256 256">
    <Path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" />
  </Svg>
);

// Reminder Item Component
const ReminderItem: React.FC<ReminderItemProps> = ({ item, onToggleComplete, darkMode }) => {
  const styles = getStyles(darkMode);
  
  return (
    <View style={[styles.reminderItem, item.checked && styles.completedItem]}>
      <View style={styles.reminderLeftContent}>
        <TouchableOpacity
          style={[styles.checkboxContainer, item.checked && styles.checkedContainer]}
          onPress={() => onToggleComplete(item.id)}
        >
          {item.checked && <CheckIcon width={20} height={20} color="#FFFFFF" />}
        </TouchableOpacity>
        <View style={styles.reminderTextContainer}>
          <Text style={[styles.reminderTitle, item.checked && styles.completedText]}>{item.title}</Text>
          <Text style={styles.reminderTime}>{item.time} • {item.date}</Text>
          {item.description && (
            <Text style={styles.reminderDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Add Task Modal Component
const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ visible, onClose, onAddTask, darkMode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const styles = getStyles(darkMode);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!title) {
      alert('Please enter a title for your reminder');
      return;
    }

    // Format date string for display (Today, Tomorrow, or full date)
    let dateString;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      dateString = 'Today';
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      dateString = 'Tomorrow';
    } else {
      dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    // Format time string
    const timeString = time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Combine date and time
    const dateTimeObj = new Date(date);
    dateTimeObj.setHours(time.getHours());
    dateTimeObj.setMinutes(time.getMinutes());

    // Create new reminder
    const newReminder: Reminder = {
      id: Date.now(), // Simple unique ID
      title,
      description,
      time: timeString,
      date: dateString,
      dateObj: dateTimeObj,
      checked: false
    };

    onAddTask(newReminder);
    handleClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Reminder</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter reminder title"
                placeholderTextColor={darkMode ? '#777' : '#9E9E9E'}
              />

              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about your reminder"
                placeholderTextColor={darkMode ? '#777' : '#9E9E9E'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon width={20} height={20} color={darkMode ? '#fff' : '#000'} />
                <Text style={styles.pickerButtonText}>
                  {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <ClockIcon width={20} height={20} color={darkMode ? '#fff' : '#000'} />
                <Text style={styles.pickerButtonText}>
                  {time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main Reminders Component
const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [dateDetailModalVisible, setDateDetailModalVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const router = useRouter();
  
  // Get current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Sample data for initial state
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const initialReminders: Reminder[] = [
      {
        id: 1,
        title: 'Take medication',
        description: 'Take blood pressure medication with breakfast',
        time: '08:00 AM',
        date: 'Today',
        dateObj: today,
        checked: false
      },
      {
        id: 2,
        title: 'Doctor appointment',
        description: 'Checkup with Dr. Johnson at Memorial Hospital',
        time: '10:30 AM',
        date: 'Tomorrow',
        dateObj: tomorrow,
        checked: false
      },
      {
        id: 3,
        title: 'Drink Water',
        description: 'Weekly call with children',
        time: '06:00 PM',
        date: 'Today',
        dateObj: today,
        checked: true
      }
    ];

    setReminders(initialReminders);
  }, []);

  const handleAddTask = (newTask: Reminder) => {
    setReminders([...reminders, newTask]);
  };

  const handleToggleComplete = (id: number) => {
    setReminders(
      reminders.map(reminder =>
        reminder.id === id
          ? { ...reminder, checked: !reminder.checked }
          : reminder
      )
    );
  };

  // Helper function to get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Format date to string for comparison
  const formatDateToString = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  // Check if a date has reminders
  const hasRemindersOnDate = (date: Date) => {
    return reminders.some(reminder => {
      const reminderDate = reminder.dateObj;
      return (
        reminderDate.getDate() === date.getDate() &&
        reminderDate.getMonth() === date.getMonth() &&
        reminderDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Get reminders for a specific date
  const getRemindersForDate = (date: Date) => {
    return reminders.filter(reminder => {
      const reminderDate = reminder.dateObj;
      return (
        reminderDate.getDate() === date.getDate() &&
        reminderDate.getMonth() === date.getMonth() &&
        reminderDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => {
      // Sort by completion status first, then by time
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.time.localeCompare(b.time);
    });
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDateDetailModalVisible(true);
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const styles = getStyles(darkMode);
    
    // Empty cells before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isToday = 
        date.getDate() === new Date().getDate() && 
        date.getMonth() === new Date().getMonth() && 
        date.getFullYear() === new Date().getFullYear();
      
      const hasReminders = hasRemindersOnDate(date);
      
      days.push(
        <TouchableOpacity 
          key={`day-${i}`} 
          style={styles.dayCell}
          onPress={() => handleDateSelect(date)}
        >
          <View style={[
            styles.dayButton,
            isToday && styles.todayButton,
            formatDateToString(selectedDate) === formatDateToString(date) && styles.selectedDayButton
          ]}>
            <Text style={[
              styles.dayText, 
              isToday && styles.todayText,
              formatDateToString(selectedDate) === formatDateToString(date) && styles.selectedDayText
            ]}>
              {i}
            </Text>
            {hasReminders && <View style={styles.reminderDot} />}
          </View>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  // Group reminders by date
  const groupedReminders = reminders.reduce((groups: Record<string, Reminder[]>, reminder) => {
    const date = reminder.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reminder);
    return groups;
  }, {});

  // Convert grouped reminders to array for rendering
  const reminderSections = Object.keys(groupedReminders).map(date => ({
    date,
    data: groupedReminders[date].sort((a, b) => {
      // Sort by completion status first, then by time
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.time.localeCompare(b.time);
    })
  }));

  const styles = getStyles(darkMode);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          {showCalendar ? (
            <BellIcon width={24} height={24} color={darkMode ? '#fff' : '#000'} />
          ) : (
            <TouchableOpacity onPress={() => setShowCalendar(true)}>
              <CalendarIcon width={24} height={24} color={darkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerTitle}>Reminders</Text>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity onPress={toggleDarkMode} style={styles.darkModeButton}>
            {darkMode ? (
              <SunIcon width={24} height={24} color="#FFD700" />
            ) : (
              <MoonIcon width={24} height={24} color="#000" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.listCalendarButton}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={styles.headerRightText}>
              {showCalendar ? "List" : "Calendar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Reminder Button */}
      <TouchableOpacity 
        style={styles.addReminderButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addReminderButtonText}>Add Reminder</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        {showCalendar ? (
          /* Calendar View */
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <CaretLeft width={18} height={18} color={darkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={goToNextMonth}>
                <CaretRight width={18} height={18} color={darkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            
            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar days */}
            <View style={styles.daysGrid}>
              {renderCalendarDays()}
            </View>
            
            {/* Today's Reminders */}
            <View style={styles.todayRemindersContainer}>
              <Text style={styles.todayRemindersTitle}>Today's Reminders</Text>
              {getRemindersForDate(new Date()).length > 0 ? (
                getRemindersForDate(new Date()).map(item => (
                  <ReminderItem
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <Text style={styles.noRemindersText}>No reminders for today</Text>
              )}
            </View>
          </View>
        ) : (
          /* List View */
          <>
            {reminderSections.length > 0 ? (
              reminderSections.map((section, index) => (
                <View key={index} style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>{section.date}</Text>
                  {section.data.map(item => (
                    <ReminderItem
                      key={item.id}
                      item={item}
                      onToggleComplete={handleToggleComplete}
                      darkMode={darkMode}
                    />
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reminders yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to add a reminder</Text>
              </View>
            )}
          </>
        )}

        {/* Bottom padding to ensure content isn't hidden behind the FAB */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <PlusIcon width={24} height={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Add Task Modal */}
      <AddTaskScreen
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTask={handleAddTask}
        darkMode={darkMode}
      />

      {/* Date Detail Modal */}
      <Modal
        visible={dateDetailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDateDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dateDetailModal}>
            <View style={styles.dateDetailHeader}>
              <Text style={styles.dateDetailTitle}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setDateDetailModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dateDetailContent}>
              {getRemindersForDate(selectedDate).length > 0 ? (
                getRemindersForDate(selectedDate).map(item => (
                  <ReminderItem
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    darkMode={darkMode}
                  />
                ))
              ) : (
                <View style={styles.emptyDateContainer}>
                  <Text style={styles.emptyDateText}>No reminders for this date</Text>
                  <TouchableOpacity 
                    style={styles.addReminderButton}
                    onPress={() => {
                      setDateDetailModalVisible(false);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.addReminderButtonText}>Add Reminder</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles with dark mode support
const getStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#121212' : '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#333' : '#EEEEEE',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    color: darkMode ? '#fff' : '#000',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    justifyContent: 'flex-end',
  },
  darkModeButton: {
    padding: 8,
    marginRight: 8,
  },
  listCalendarButton: {
    padding: 8,
  },
  headerRightText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkMode ? '#fff' : '#000',
  },
  // Add Reminder Button styles
  addReminderButton: {
    backgroundColor: darkMode ? '#BB86FC' : '#000',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addReminderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: darkMode ? '#fff' : '#000',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
    padding: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#333' : '#F5F5F5',
  },
  completedItem: {
    opacity: 0.7,
  },
  reminderLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: darkMode ? '#BB86FC' : '#000',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedContainer: {
    backgroundColor: darkMode ? '#BB86FC' : '#000',
    borderColor: darkMode ? '#BB86FC' : '#000',
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: darkMode ? '#fff' : '#000',
  },
  reminderTime: {
    fontSize: 14,
    color: darkMode ? '#aaa' : '#6B6B6B',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: darkMode ? '#aaa' : '#6B6B6B',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: darkMode ? '#fff' : '#000',
  },
  emptySubtext: {
    fontSize: 16,
    color: darkMode ? '#aaa' : '#6B6B6B',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fab: {
    backgroundColor: darkMode ? '#BB86FC' : '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomSpace: {
    height: 80,
  },
  
  // Calendar styles
  calendarContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 4,
    marginBottom: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    color: darkMode ? '#fff' : '#000',
  },
  weekdayRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: darkMode ? '#aaa' : '#6B6B6B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 16,
  },
  dayCell: {
    width: '14.28%', // 7 days per row
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: darkMode ? '#BB86FC' : '#000',
  },
  todayButton: {
    borderWidth: 1,
    borderColor: darkMode ? '#BB86FC' : '#000',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: darkMode ? '#fff' : '#000',
  },
  todayText: {
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reminderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    position: 'absolute',
    bottom: 4,
  },
  todayRemindersContainer: {
    width: '100%',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: darkMode ? '#333' : '#EEEEEE',
    paddingTop: 16,
  },
  todayRemindersTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: darkMode ? '#fff' : '#000',
  },
  noRemindersText: {
    fontSize: 16,
    color: darkMode ? '#aaa' : '#6B6B6B',
    textAlign: 'center',
    paddingVertical: 24,
  },
  
  // Date Detail Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dateDetailModal: {
    backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '60%',
    maxHeight: '80%',
    paddingBottom: 20,
  },
  dateDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#333' : '#EEEEEE',
  },
  dateDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkMode ? '#fff' : '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  dateDetailContent: {
    flex: 1,
  },
  emptyDateContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyDateText: {
    fontSize: 16,
    color: darkMode ? '#aaa' : '#6B6B6B',
    marginBottom: 16,
  },

  // Add Task Modal styles
  modalContent: {
    backgroundColor: darkMode ? '#1E1E1E' : 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkMode ? '#333' : '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: darkMode ? '#fff' : '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: 'red',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: darkMode ? '#fff' : '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: darkMode ? '#333' : '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: darkMode ? '#2D2D2D' : '#F9F9F9',
    color: darkMode ? '#fff' : '#000',
  },
  textArea: {
    height: 100,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkMode ? '#333' : '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: darkMode ? '#2D2D2D' : '#F9F9F9',
  },
  pickerButtonText: {
    fontSize: 16,
    marginLeft: 8,
    color: darkMode ? '#fff' : '#000',
  },
  saveButton: {
    backgroundColor: darkMode ? '#BB86FC' : 'black',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RemindersScreen;