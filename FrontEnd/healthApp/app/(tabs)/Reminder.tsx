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
const CustomCheckbox = ({ checked, onToggle }:any) => (
    <TouchableOpacity
        onPress={onToggle}
        style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: '#E9DFCE',
            backgroundColor: checked ? '#019863' : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        {checked && <Feather name="check" size={14} color="white" />}
    </TouchableOpacity>
);

// Separated Add Reminder Modal from Code 1
interface AddReminderModalProps {
    visible: boolean;
    onClose: () => void;
    reminderText: string;
    setReminderText: (text: string) => void;
    date: Date;
    setDate: (date: Date) => void;
    onAdd: () => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
    visible,
    onClose,
    reminderText,
    setReminderText,
    date,
    setDate,
    onAdd
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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
            <View className="flex-1 justify-center items-center bg-black bg-opacity-60">
                <View className="bg-white p-5 rounded-2xl w-[90%]">
                    <Text className="text-xl font-bold mb-4">New Reminder</Text>

                    <TextInput
                        placeholder="Reminder"
                        className="border border-gray-300 p-2 rounded mb-4"
                        value={reminderText}
                        onChangeText={setReminderText}
                    />

                    <TouchableOpacity
                        className="flex-row items-center mb-2"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text className="text-lg">📅 Date: {date.toDateString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center mb-4"
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text className="text-lg">⏰ Time: {date.toLocaleTimeString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={date}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                        />
                    )}

                    <View className="flex-row justify-between mt-6">
                        <TouchableOpacity
                            className="bg-gray-300 px-4 py-2 rounded"
                            onPress={onClose}
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-green-600 px-4 py-2 rounded"
                            onPress={onAdd}
                        >
                            <Text className="text-white">Add</Text>
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
    const [darkMode, setDarkMode] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [newReminder, setNewReminder] = useState('');
    const [date, setDate] = useState(new Date());

    const days = [
        { short: '6', name: 'mon' },
        { short: '7', name: 'tue' },
        { short: '8', name: 'wed' },
        { short: '9', name: 'thur' }
    ];

    const [tasks, setTasks] = useState({
        today: [
            { id: 1, text: 'take pills', completed: false },
            { id: 2, text: 'checkup', completed: false }
        ],
        tomorrow: [
            { id: 3, text: 'take pills', completed: false },
            { id: 4, text: 'checkup', completed: false }
        ]
    });

    const toggleTask = (section: keyof typeof tasks, id: number) => {
        if (!tasks[section]) return;
        setTasks(prev => ({
            ...prev,
            [section]: prev[section].map(task =>
                task.id === id ? { ...task, completed: true } : task
            )
        }));
        setTimeout(() => {
            setTasks(prev => ({
                ...prev,
                [section]: prev[section].filter(task => task.id !== id)
            }));
        }, 3000);
    };

    const addNewReminder = () => {
        const newTask = {
            id: Date.now(),
            text: `${newReminder} (${date.toLocaleString()})`,
            completed: false
        };
        setTasks(prev => ({
            ...prev,
            today: [...prev.today, newTask]
        }));
        setModalVisible(false);
        setNewReminder('');
        setDate(new Date());
    };

    const backgroundColor = darkMode ? '#1C1C1E' : 'white';
    const textColor = darkMode ? 'white' : '#1C160C';

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
            <StatusBar backgroundColor={backgroundColor} barStyle={darkMode ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor,
                padding: 16,
                paddingBottom: 8,
                justifyContent: 'space-between'
            }}>
                <TouchableOpacity style={{ width: 48, height: 48, justifyContent: 'center' }}>
                    <Feather name="menu" size={24} color={textColor} />
                </TouchableOpacity>

                <Text style={{ color: textColor, fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
                    Reminders
                </Text>

                <TouchableOpacity
                    onPress={() => setDarkMode(!darkMode)}
                    style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Feather name={darkMode ? 'sun' : 'moon'} size={24} color={textColor} />
                </TouchableOpacity>
            </View>

            {/* Day Selector */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E9DFCE' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 16,
                                borderBottomWidth: selectedDay === index ? 2 : 0,
                                borderBottomColor: '#019863'
                            }}
                            onPress={() => setSelectedDay(index)}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: selectedDay === index ? textColor : '#A18249'
                            }}>
                                {day.short} {day.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Task List */}
            <ScrollView style={{ flex: 1 }}>
                <Text style={{
                    color: textColor,
                    fontSize: 22,
                    fontWeight: 'bold',
                    paddingHorizontal: 16,
                    paddingTop: 20,
                    paddingBottom: 12
                }}>Things to do:</Text>

                {/* Today */}
                <Text style={{
                    color: textColor,
                    fontSize: 18,
                    fontWeight: 'bold',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 8
                }}>Today:</Text>
                <View style={{ paddingHorizontal: 16 }}>
                    {tasks.today.map((task) => (
                        <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                            <CustomCheckbox
                                checked={task.completed}
                                onToggle={() => toggleTask('today', task.id)}
                            />
                            <Text style={{ color: textColor, marginLeft: 12 }}>{task.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Tomorrow */}
                <Text style={{
                    color: textColor,
                    fontSize: 18,
                    fontWeight: 'bold',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 8
                }}>Tomorrow:</Text>
                <View style={{ paddingHorizontal: 16 }}>
                    {tasks.tomorrow.map((task) => (
                        <View key={task.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                            <CustomCheckbox
                                checked={task.completed}
                                onToggle={() => toggleTask('tomorrow', task.id)}
                            />
                            <Text style={{ color: textColor, marginLeft: 12 }}>{task.text}</Text>
                        </View>
                    ))}
                </View>

                {/* Add Button */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F4EFE6',
                            height: 48,
                            borderRadius: 24
                        }}>
                        <Feather name="plus" size={24} color="#1C160C" />
                        <Text style={{ color: '#1C160C', fontWeight: 'bold', marginLeft: 8 }}>Add Reminder</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderTopColor: '#F4EFE6',
                backgroundColor,
                paddingHorizontal: 16,
                paddingVertical: 12,
                justifyContent: 'space-between'
            }}>
                <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                    <Feather name="home" size={24} color="#A18249" />
                    <Text style={{ color: '#A18249', fontSize: 12, marginTop: 4 }}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                    <Feather name="file-text" size={24} color={textColor} />
                    <Text style={{ color: textColor, fontSize: 12, marginTop: 4 }}>Reminders</Text>
                </TouchableOpacity>

                <View style={{ flex: 1 }} />
                <View style={{ flex: 1 }} />
                <View style={{ flex: 1 }} />
            </View>

            {/* Imported Add Reminder Modal */}
            <AddReminderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                reminderText={newReminder}
                setReminderText={setNewReminder}
                date={date}
                setDate={setDate}
                onAdd={addNewReminder}
            />
        </SafeAreaView>
    );
};

export default Reminder;
