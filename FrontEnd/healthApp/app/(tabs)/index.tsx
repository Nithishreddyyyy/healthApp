import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Modal,
    TextInput,
    Alert
} from 'react-native';
import {
    Bell,
    PencilSimple,
    House,
    ChartLine,
    Note,
    Gear,
    Moon,
    Sun,
    ChatCircleDots,
    X,
    PaperPlaneRight,
    Globe,
    Check,
    Trophy
} from 'phosphor-react-native';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Create a new i18n instance
const i18n = new I18n({
    en: {
        welcome: 'Welcome!',
        quote: 'Quote of the Day',
        quoteContent: 'The only way to do great work is to love what you do.',
        quoteAuthor: '- Steve Jobs',
        reminders: 'Reminders',
        reminder: 'Reminder',
        details: 'Details about reminder',
        progress: 'Progress',
        steps: 'Steps',
        stepsProgress: '7,500/10,000 steps',
        exercise: 'Exercise',
        exerciseProgress: '30/60 minutes',
        home: 'Home',
        activity: 'Activity',
        stats: 'Stats',
        reminderTab: 'Reminders',
        settings: 'Settings',
        chatbot: 'Chatbot',
        typeMessage: 'Type a message...',
        dailyStreak: 'Daily Streak',
        days: 'days',
        incrementStreak: 'Complete Today',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit Reminder',
    },
    hi: {
        welcome: 'स्वागत है!',
        quote: 'आज का विचार',
        quoteContent: 'महान काम करने का एकमात्र तरीका है जो आप करते हैं उससे प्यार करना।',
        quoteAuthor: '- स्टीव जॉब्स',
        reminders: 'अनुस्मारक',
        reminder: 'अनुस्मारक',
        details: 'अनुस्मारक का विवरण',
        progress: 'प्रगति',
        steps: 'कदम',
        stepsProgress: '7,500/10,000 कदम',
        exercise: 'व्यायाम',
        exerciseProgress: '30/60 मिनट',
        home: 'होम',
        activity: 'गतिविधि',
        stats: 'आँकड़े',
        reminderTab: 'अनुस्मारक',
        settings: 'सेटिंग्स',
        chatbot: 'चैटबॉट',
        typeMessage: 'संदेश टाइप करें...',
        dailyStreak: 'दैनिक स्ट्रीक',
        days: 'दिन',
        incrementStreak: 'आज पूरा करें',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        edit: 'अनुस्मारक संपादित करें',
    },
    kn: {
        welcome: 'ಸ್ವಾಗತ!',
        quote: 'ಇಂದಿನ ಉಲ್ಲೇಖ',
        quoteContent: 'ಉತ್ತಮ ಕೆಲಸ ಮಾಡಲು ಒಂದೇ ಮಾರ್ಗವೆಂದರೆ ನೀವು ಮಾಡುವುದನ್ನು ಪ್ರೀತಿಸುವುದು.',
        quoteAuthor: '- ಸ್ಟೀವ್ ಜಾಬ್ಸ್',
        reminders: 'ಜ್ಞಾಪನೆಗಳು',
        reminder: 'ಜ್ಞಾಪನೆ',
        details: 'ಜ್ಞಾಪನೆಯ ವಿವರಗಳು',
        progress: 'ಪ್ರಗತಿ',
        steps: 'ಹೆಜ್ಜೆಗಳು',
        stepsProgress: '7,500/10,000 ಹೆಜ್ಜೆಗಳು',
        exercise: 'ವ್ಯಾಯಾಮ',
        exerciseProgress: '30/60 ನಿಮಿಷಗಳು',
        home: 'ಮನೆ',
        activity: 'ಚಟುವಟಿಕೆ',
        stats: 'ಅಂಕಿಅಂಶಗಳು',
        reminderTab: 'ಜ್ಞಾಪನೆಗಳು',
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        chatbot: 'ಚಾಟ್‌ಬಾಟ್',
        typeMessage: 'ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
        dailyStreak: 'ದೈನಂದಿನ ಸ್ಟ್ರೀಕ್',
        days: 'ದಿನಗಳು',
        incrementStreak: 'ಇಂದು ಪೂರ್ಣಗೊಳಿಸಿ',
        save: 'ಉಳಿಸಿ',
        cancel: 'ರದ್ದುಮಾಡಿ',
        edit: 'ಜ್ಞಾಪನೆಯನ್ನು ಸಂಪಾದಿಸಿ',
    },
});

// Configure i18n
i18n.locale = Localization.locale;
i18n.enableFallback = true;

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [chatVisible, setChatVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [lang, setLang] = useState('en');
    const [streak, setStreak] = useState(7);
    const [reminders, setReminders] = useState([
        { id: 1, title: 'Take Medication', details: 'Daily vitamins and supplements' },
        { id: 2, title: 'Drink Water', details: '8 glasses of water daily' }
    ]);
    const [editingReminder, setEditingReminder] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDetails, setEditDetails] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { id: 1, text: 'Hello! How can I help you today?', isUser: false }
    ]);

    const toggleLang = () => {
        let newLang;
        if (lang === 'en') {
            newLang = 'hi';
        } else if (lang === 'hi') {
            newLang = 'kn';
        } else {
            newLang = 'en';
        }
        i18n.locale = newLang;
        setLang(newLang);
    };

    // Updated theme with vibrant gradient colors
    const theme = {
        // Backgrounds
        background: isDarkMode ? '#0E0E0E' : '#F7F7F7',
        card: isDarkMode ? '#1A1A1A' : '#FFFFFF',
        modal: isDarkMode ? '#222222' : '#FFFFFF',
        progressTrack: isDarkMode ? '#2D2D2D' : '#EDEDED',
        
        // Text
        text: isDarkMode ? '#F4F4F4' : '#1A1A1A',
        secondaryText: isDarkMode ? '#A0A0A0' : '#666666',
        
        // Accent colors (gradient components)
        accentPrimary: '#5B00FF',
        accentSecondary: '#FF4F8B',
        accentTertiary: '#1A00FF',
        accentOrange: '#FF6A3D',
        
        // Special elements
        quoteBg: isDarkMode ? '#2A1E3A' : '#F0E8FF',
        streakBg: isDarkMode ? '#1E2A3A' : '#E8F0FF',
        chatbotBg: isDarkMode ? '#5B00FF' : '#5B00FF', // Keep vibrant even in light mode
    };

    const getGradientStyle = (colors: string[]) => ({
        background: `linear-gradient(45deg, ${colors.join(', ')})`,
    });

    const incrementStreak = () => {
        setStreak(streak + 1);
        Alert.alert("Great job!", "Your streak has been updated!");
    };

    const startEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setEditTitle(reminder.title);
        setEditDetails(reminder.details);
        setEditModalVisible(true);
    };

    const saveEditedReminder = () => {
        setReminders(reminders.map(item => 
            item.id === editingReminder.id 
                ? { ...item, title: editTitle, details: editDetails } 
                : item
        ));
        setEditModalVisible(false);
    };

    const sendMessage = () => {
        if (message.trim() === '') return;
        
        const userMessage = { id: chatMessages.length + 1, text: message, isUser: true };
        setChatMessages([...chatMessages, userMessage]);
        
        setTimeout(() => {
            const botResponse = { 
                id: chatMessages.length + 2, 
                text: "I'm just a demo chatbot. I cannot respond to specific queries.", 
                isUser: false 
            };
            setChatMessages(prev => [...prev, botResponse]);
        }, 500);
        
        setMessage('');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar backgroundColor={theme.background} barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{i18n.t('welcome')}</Text>
                    <View style={styles.iconRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleLang}>
                            <Globe size={24} color={theme.text} weight="regular" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
                            {isDarkMode ? (
                                <Sun size={24} color={theme.text} weight="regular" />
                            ) : (
                                <Moon size={24} color={theme.text} weight="regular" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quote Section with gradient border */}
                <View style={[
                    styles.quoteSection, 
                    { 
                        backgroundColor: theme.quoteBg,
                        borderLeftWidth: 6,
                        borderLeftColor: theme.accentPrimary,
                        borderRadius: 12,
                        margin: 16 
                    }
                ]}>
                    <View style={styles.quoteTextContainer}>
                        <Text style={[styles.quoteTitle, { color: theme.text }]}>{i18n.t('quote')}</Text>
                        <Text style={[styles.quoteContent, { color: theme.text }]}>
                            {i18n.t('quoteContent')}
                        </Text>
                        <Text style={[styles.quoteAuthor, { color: theme.secondaryText }]}>
                            {i18n.t('quoteAuthor')}
                        </Text>
                    </View>
                </View>
                
                {/* Streak Counter with gradient background */}
                <View style={[
                    styles.streakSection, 
                    { 
                        backgroundColor: theme.streakBg,
                        borderRadius: 12,
                        margin: 16,
                        overflow: 'hidden',
                        position: 'relative'
                    }
                ]}>
                    {/* Gradient overlay */}
                    <View style={[
                        StyleSheet.absoluteFill,
                        {
                            opacity: isDarkMode ? 0.15 : 0.1,
                            background: `linear-gradient(45deg, ${theme.accentPrimary}, ${theme.accentSecondary})`
                        }
                    ]} />
                    
                    <View style={styles.streakTextContainer}>
                        <Text style={[styles.streakTitle, { color: theme.text }]}>{i18n.t('dailyStreak')}</Text>
                        <View style={styles.streakCountContainer}>
                            <Trophy size={28} color={theme.accentPrimary} weight="fill" />
                            <Text style={[styles.streakCount, { color: theme.text }]}>{streak} {i18n.t('days')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[
                            styles.streakButton, 
                            { 
                                backgroundColor: theme.accentPrimary,
                                shadowColor: theme.accentPrimary,
                                shadowOpacity: 0.4,
                                shadowRadius: 10,
                                shadowOffset: { width: 0, height: 4 }
                            }
                        ]}
                        onPress={incrementStreak}
                    >
                        <Check size={20} color="#FFFFFF" weight="bold" />
                        <Text style={styles.streakButtonText}>{i18n.t('incrementStreak')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Reminders Section */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('reminders')}</Text>

                {reminders.map((item) => (
                    <View 
                        style={[
                            styles.reminderItem, 
                            { 
                                backgroundColor: theme.card,
                                borderRadius: 12,
                                marginHorizontal: 16,
                                marginVertical: 8,
                                padding: 16
                            }
                        ]} 
                        key={item.id}
                    >
                        <View style={styles.reminderContent}>
                            <View style={[
                                styles.reminderIconContainer, 
                                { 
                                    backgroundColor: isDarkMode ? '#2A1E3A' : '#F0E8FF',
                                }
                            ]}>
                                <Bell size={24} color={theme.accentPrimary} weight="regular" />
                            </View>
                            <View style={styles.reminderTextContainer}>
                                <Text style={[styles.reminderTitle, { color: theme.text }]}>{item.title}</Text>
                                <Text style={[styles.reminderDetails, { color: theme.secondaryText }]}>
                                    {item.details}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => startEditReminder(item)}>
                            <PencilSimple size={24} color={theme.accentSecondary} weight="regular" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Progress Section */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 16 }]}>{i18n.t('progress')}</Text>

                {/* Steps Progress */}
                <View style={[
                    styles.progressContainer, 
                    { 
                        backgroundColor: theme.card,
                        borderRadius: 12,
                        marginHorizontal: 16,
                        padding: 16
                    }
                ]}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>{i18n.t('steps')}</Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.progressTrack }]}>
                        <View style={[
                            styles.progressBar, 
                            { 
                                width: '75%', 
                                background: `linear-gradient(90deg, ${theme.accentPrimary}, ${theme.accentSecondary})`
                            }
                        ]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>{i18n.t('stepsProgress')}</Text>
                </View>

                {/* Exercise Progress */}
                <View style={[
                    styles.progressContainer, 
                    { 
                        backgroundColor: theme.card,
                        borderRadius: 12,
                        margin: 16,
                        padding: 16
                    }
                ]}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>{i18n.t('exercise')}</Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.progressTrack }]}>
                        <View style={[
                            styles.progressBar, 
                            { 
                                width: '50%', 
                                background: `linear-gradient(90deg, ${theme.accentPrimary}, ${theme.accentOrange})`
                            }
                        ]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>{i18n.t('exerciseProgress')}</Text>
                </View>
                
                {/* Bottom padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Navigation Bar */}
            <View style={[
                styles.navBar, 
                { 
                    backgroundColor: theme.card,
                    borderTopColor: isDarkMode ? '#333333' : '#EDEDED'
                }
            ]}>
                <TouchableOpacity style={styles.navItem}>
                    <House size={24} color={theme.text} weight="fill" />
                    <Text style={[styles.navTextActive, { color: theme.text }]}>{i18n.t('home')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <ChartLine size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>{i18n.t('activity')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <ChartLine size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>{i18n.t('stats')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Note size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>{i18n.t('reminderTab')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Gear size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>{i18n.t('settings')}</Text>
                </TouchableOpacity>
            </View>

            {/* Chatbot Floating Button with gradient */}
            <TouchableOpacity
                style={[
                    styles.chatbotButton, 
                    { 
                        bottom: 100,
                        backgroundColor: theme.chatbotBg,
                        shadowColor: theme.accentPrimary,
                        shadowOpacity: 0.6,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 }
                    }
                ]}
                onPress={() => setChatVisible(true)}
            >
                <ChatCircleDots size={28} color="#ffffff" weight="fill" />
            </TouchableOpacity>

            {/* Chat Modal */}
            <Modal
                transparent
                animationType="slide"
                visible={chatVisible}
                onRequestClose={() => setChatVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[
                        styles.chatModal, 
                        { 
                            backgroundColor: theme.modal,
                            borderColor: isDarkMode ? '#333333' : '#EDEDED'
                        }
                    ]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('chatbot')}</Text>
                            <TouchableOpacity onPress={() => setChatVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.chatMessagesContainer}>
                            {chatMessages.map(msg => (
                                <View 
                                    key={msg.id}
                                    style={[
                                        styles.chatBubble,
                                        msg.isUser ? styles.userBubble : styles.botBubble,
                                        { 
                                            backgroundColor: msg.isUser 
                                                ? theme.accentPrimary 
                                                : isDarkMode 
                                                    ? '#2D2D2D' 
                                                    : '#EDEDED'
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.chatText, 
                                        { 
                                            color: msg.isUser 
                                                ? '#FFFFFF' 
                                                : theme.text 
                                        }
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                        
                        <View style={[
                            styles.chatInputContainer,
                            { borderColor: isDarkMode ? '#333333' : '#EDEDED' }
                        ]}>
                            <TextInput
                                style={[
                                    styles.textInput, 
                                    { 
                                        color: theme.text, 
                                        backgroundColor: isDarkMode ? '#2D2D2D' : '#F7F7F7',
                                        borderColor: isDarkMode ? '#333333' : '#EDEDED'
                                    }
                                ]}
                                placeholder={i18n.t('typeMessage')}
                                placeholderTextColor={theme.secondaryText}
                                value={message}
                                onChangeText={setMessage}
                            />
                            <TouchableOpacity 
                                onPress={sendMessage}
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: theme.accentPrimary }
                                ]}
                            >
                                <PaperPlaneRight size={20} color="#FFFFFF" weight="fill" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* Reminder Edit Modal */}
            <Modal
                transparent
                animationType="slide"
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[
                        styles.editModal, 
                        { 
                            backgroundColor: theme.modal,
                            borderColor: isDarkMode ? '#333333' : '#EDEDED'
                        }
                    ]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('edit')}</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.editFormContainer}>
                            <Text style={[styles.inputLabel, { color: theme.text }]}>{i18n.t('reminder')}</Text>
                            <TextInput
                                style={[
                                    styles.editInput, 
                                    { 
                                        color: theme.text, 
                                        backgroundColor: isDarkMode ? '#2D2D2D' : '#F7F7F7',
                                        borderColor: isDarkMode ? '#333333' : '#EDEDED'
                                    }
                                ]}
                                value={editTitle}
                                onChangeText={setEditTitle}
                            />
                            
                            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 16 }]}>{i18n.t('details')}</Text>
                            <TextInput
                                style={[
                                    styles.editInput, 
                                    { 
                                        color: theme.text, 
                                        backgroundColor: isDarkMode ? '#2D2D2D' : '#F7F7F7',
                                        borderColor: isDarkMode ? '#333333' : '#EDEDED',
                                        height: 100,
                                        textAlignVertical: 'top'
                                    }
                                ]}
                                value={editDetails}
                                onChangeText={setEditDetails}
                                multiline
                            />
                            
                            <View style={styles.editButtonsContainer}>
                                <TouchableOpacity 
                                    style={[
                                        styles.editButton, 
                                        { 
                                            backgroundColor: 'transparent', 
                                            borderColor: theme.secondaryText 
                                        }
                                    ]}
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text style={[styles.editButtonText, { color: theme.secondaryText }]}>{i18n.t('cancel')}</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[
                                        styles.editButton, 
                                        { 
                                            backgroundColor: theme.accentPrimary,
                                            shadowColor: theme.accentPrimary,
                                            shadowOpacity: 0.3,
                                            shadowRadius: 6,
                                            shadowOffset: { width: 0, height: 2 }
                                        }
                                    ]}
                                    onPress={saveEditedReminder}
                                >
                                    <Text style={styles.editButtonText}>{i18n.t('save')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 8,
    },
    iconRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconButton: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'left',
    },
    quoteSection: {
        padding: 20,
    },
    quoteTextContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    quoteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    quoteContent: {
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 26,
    },
    quoteAuthor: {
        fontSize: 16,
        textAlign: 'right',
        marginTop: 8,
    },
    streakSection: {
        padding: 20,
    },
    streakTextContainer: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 16,
    },
    streakTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    streakCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    streakCount: {
        fontSize: 22,
        fontWeight: '600',
    },
    streakButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    streakButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingBottom: 12,
        paddingTop: 20,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 72,
    },
    reminderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    reminderIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reminderTextContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
    },
    reminderTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    reminderDetails: {
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
    },
    navBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    navItem: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    navTextActive: {
        fontSize: 12,
        fontWeight: '500',
    },
    navTextInactive: {
        fontSize: 12,
        fontWeight: '500',
    },
    chatbotButton: {
        position: 'absolute',
        right: 20,
        padding: 16,
        borderRadius: 30,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    chatModal: {
        height: '70%',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        borderWidth: 1,
    },
    editModal: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    chatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 12,
        gap: 8,
        marginTop: 'auto',
    },
    textInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    sendButton: {
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatMessagesContainer: {
        flex: 1,
        marginBottom: 12,
    },
    chatBubble: {
        padding: 12,
        borderRadius: 16,
        marginVertical: 6,
        maxWidth: '80%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    chatText: {
        fontSize: 16,
    },
    editFormContainer: {
        padding: 8,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    editInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    editButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
    },
});

export default App;