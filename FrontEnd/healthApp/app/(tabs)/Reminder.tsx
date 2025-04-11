import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    Platform,
    ScrollView,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Reusable Checkbox Component
const CustomCheckbox = ({ checked, onToggle, darkMode }:any) => (
    <TouchableOpacity
        onPress={onToggle}
        style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: darkMode ? '#5B00FF' : '#A18249',
            backgroundColor: checked ? '#5B00FF' : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        {checked && <Feather name="check" size={16} color="white" />}
    </TouchableOpacity>
);

// Separated Add Reminder Modal
interface AddReminderModalProps {
    visible: boolean;
    onClose: () => void;
    reminderText: string;
    setReminderText: (text: string) => void;
    date: Date;
    setDate: (date: Date) => void;
    onAdd: () => void;
    darkMode: boolean;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
    visible,
    onClose,
    reminderText,
    setReminderText,
    date,
    setDate,
    onAdd,
    darkMode
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const theme = {
        background: darkMode ? '#0E0E0E' : '#F7F7F7',
        card: darkMode ? '#1A1A1A' : '#FFFFFF',
        text: darkMode ? '#F4F4F4' : '#1A1A1A',
        secondaryText: darkMode ? '#A0A0A0' : '#666666',
        border: darkMode ? '#333333' : '#EDEDED',
        accentPrimary: '#5B00FF',
        accentSecondary: '#FF4F8B',
    };

    const onChangeDate = ({event, selectedDate}:any) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const onChangeTime = ({event, selectedTime}:any) => {
        const currentTime = selectedTime || date;
        setShowTimePicker(Platform.OS === 'ios');
        setDate(currentTime);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <View style={{ 
                    backgroundColor: theme.card, 
                    padding: 20, 
                    borderRadius: 16, 
                    width: '90%',
                    borderWidth: 1,
                    borderColor: theme.border
                }}>
                    <Text style={{ 
                        fontSize: 20, 
                        fontWeight: 'bold', 
                        marginBottom: 16, 
                        color: theme.text 
                    }}>
                        New Reminder
                    </Text>

                    <TextInput
                        placeholder="Reminder"
                        placeholderTextColor={theme.secondaryText}
                        style={{ 
                            borderWidth: 1, 
                            borderColor: theme.border, 
                            padding: 12, 
                            borderRadius: 8, 
                            marginBottom: 16,
                            backgroundColor: darkMode ? '#2D2D2D' : '#FFFFFF',
                            color: theme.text
                        }}
                        value={reminderText}
                        onChangeText={setReminderText}
                    />

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ fontSize: 16, color: theme.text }}>📅 Date: {date.toDateString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={{ fontSize: 16, color: theme.text }}>⏰ Time: {date.toLocaleTimeString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                            textColor={darkMode ? '#FFFFFF' : '#000000'}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={date}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                            textColor={darkMode ? '#FFFFFF' : '#000000'}
                        />
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                        <TouchableOpacity
                            style={{ 
                                backgroundColor: theme.secondaryText, 
                                paddingHorizontal: 16, 
                                paddingVertical: 12, 
                                borderRadius: 8,
                                opacity: 0.8
                            }}
                            onPress={onClose}
                        >
                            <Text style={{ color: theme.card }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ 
                                backgroundColor: theme.accentPrimary, 
                                paddingHorizontal: 16, 
                                paddingVertical: 12, 
                                borderRadius: 8,
                                shadowColor: theme.accentPrimary,
                                shadowOpacity: 0.4,
                                shadowRadius: 6,
                                shadowOffset: { width: 0, height: 2 }
                            }}
                            onPress={onAdd}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Main Reminder Screen
const Reminder = () => {
    const [selectedDay, setSelectedDay] = useState(3);
    const [darkMode, setDarkMode] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [newReminder, setNewReminder] = useState('');
    const [date, setDate] = useState(new Date());

    const days = [
        { short: '6', name: 'mon' },
        { short: '7', name: 'tue' },
        { short: '8', name: 'wed' },
        { short: '9', name: 'thur' }
    ];

    const [reminders, setReminders] = useState([
        { id: 1, text: 'Take medication', completed: false },
        { id: 2, text: 'Doctor appointment', completed: false },
        { id: 3, text: 'Physical therapy', completed: false },
        { id: 4, text: 'Blood test', completed: false }
    ]);

    const toggleReminder = (id: number) => {
        setReminders(prev =>
            prev.map(reminder =>
                reminder.id === id ? { ...reminder, completed: true } : reminder
            )
        );
        setTimeout(() => {
            setReminders(prev => prev.filter(reminder => reminder.id !== id));
        }, 3000);
    };

    const addNewReminder = () => {
        const newTask = {
            id: Date.now(),
            text: `${newReminder} (${date.toLocaleString()})`,
            completed: false
        };
        setReminders(prev => [...prev, newTask]);
        setModalVisible(false);
        setNewReminder('');
        setDate(new Date());
    };

    const theme = {
        background: darkMode ? '#0E0E0E' : '#F7F7F7',
        card: darkMode ? '#1A1A1A' : '#FFFFFF',
        text: darkMode ? '#F4F4F4' : '#1A1A1A',
        secondaryText: darkMode ? '#A0A0A0' : '#666666',
        border: darkMode ? '#333333' : '#EDEDED',
        accentPrimary: '#5B00FF',
        accentSecondary: '#FF4F8B',
        accentTertiary: '#1A00FF',
        accentOrange: '#FF6A3D',
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <StatusBar backgroundColor={theme.background} barStyle={darkMode ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                paddingBottom: 8,
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: theme.border
            }}>
                <TouchableOpacity style={{ width: 48, height: 48, justifyContent: 'center' }}>
                    <Feather name="menu" size={24} color={theme.text} />
                </TouchableOpacity>

                <Text style={{ 
                    color: theme.text, 
                    fontSize: 20, 
                    fontWeight: 'bold', 
                    flex: 1, 
                    textAlign: 'center',
                    textShadowColor: darkMode ? theme.accentPrimary : 'transparent',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: darkMode ? 8 : 0
                }}>
                    Reminders
                </Text>

                <TouchableOpacity
                    onPress={() => setDarkMode(!darkMode)}
                    style={{ 
                        width: 48, 
                        height: 48, 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: darkMode ? '#2A1E3A' : '#F0E8FF',
                        borderRadius: 24
                    }}
                >
                    <Feather 
                        name={darkMode ? 'sun' : 'moon'} 
                        size={20} 
                        color={darkMode ? theme.accentSecondary : theme.accentPrimary} 
                    />
                </TouchableOpacity>
            </View>

            {/* Day Selector */}
            <View style={{ 
                borderBottomWidth: 1, 
                borderBottomColor: theme.border,
                backgroundColor: darkMode ? '#1A1A1A' : '#FFFFFF'
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 16,
                                borderBottomWidth: selectedDay === index ? 2 : 0,
                                borderBottomColor: theme.accentPrimary
                            }}
                            onPress={() => setSelectedDay(index)}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: selectedDay === index ? theme.text : theme.secondaryText
                            }}>
                                {day.short} {day.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Reminders List */}
            <ScrollView style={{ flex: 1, paddingTop: 16 }}>
                <Text style={{
                    color: theme.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                    paddingHorizontal: 16,
                    paddingBottom: 12
                }}>Your Reminders:</Text>

                <View style={{ paddingHorizontal: 16 }}>
                    {reminders.map((reminder) => (
                        <View key={reminder.id} style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            paddingVertical: 12,
                            backgroundColor: theme.card,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 8,
                            borderWidth: 1,
                            borderColor: theme.border
                        }}>
                            <CustomCheckbox
                                checked={reminder.completed}
                                onToggle={() => toggleReminder(reminder.id)}
                                darkMode={darkMode}
                            />
                            <Text style={{ 
                                color: reminder.completed ? theme.secondaryText : theme.text, 
                                marginLeft: 16,
                                fontSize: 16,
                                textDecorationLine: reminder.completed ? 'line-through' : 'none'
                            }}>
                                {reminder.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Add Button */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.accentPrimary,
                            height: 48,
                            borderRadius: 24,
                            shadowColor: theme.accentPrimary,
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 2 }
                        }}>
                        <Feather name="plus" size={20} color="white" />
                        <Text style={{ 
                            color: 'white', 
                            fontWeight: 'bold', 
                            marginLeft: 8,
                            fontSize: 16 
                        }}>
                            Add Reminder
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderTopColor: theme.border,
                backgroundColor: theme.background,
                paddingHorizontal: 16,
                paddingVertical: 12,
                justifyContent: 'space-between'
            }}>
                <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                    <Feather name="home" size={24} color={theme.secondaryText} />
                    <Text style={{ color: theme.secondaryText, fontSize: 12, marginTop: 4 }}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                    <Feather name="file-text" size={24} color={theme.accentPrimary} />
                    <Text style={{ color: theme.accentPrimary, fontSize: 12, marginTop: 4 }}>Reminders</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />
                <View style={{ flex: 1 }} />
                <View style={{ flex: 1 }} />
            </View>

            {/* Add Reminder Modal */}
            <AddReminderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                reminderText={newReminder}
                setReminderText={setNewReminder}
                date={date}
                setDate={setDate}
                onAdd={addNewReminder}
                darkMode={darkMode}
            />
        </SafeAreaView>
    );
};

export default Reminder;