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
    TextInput
} from 'react-native';
import {
    Bell,
    PencilSimple,
    House,
    ChartLine,
    Note,
    Gear,
    List,
    Moon,
    Sun,
    ChatCircleDots,
    X,
    PaperPlaneRight,
    Globe
} from 'phosphor-react-native';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js'; // Updated import for newer i18n-js versions

// Create a new i18n instance
const i18n = new I18n({
    en: {
        welcome: 'Welcome!',
        quote: 'Quote',
        quoteSubtitle: 'Inspirational quote with emoji',
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
    },
    hi: {
        welcome: 'स्वागत है!',
        quote: 'उद्धरण',
        quoteSubtitle: 'प्रेरणादायक उद्धरण और इमोजी',
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
    },
    kn: {
        welcome: 'ಸ್ವಾಗತ!',
        quote: 'ಉಲ್ಲೇಖ',
        quoteSubtitle: 'ಪ್ರೇರಣಾದಾಯಕ ಉಲ್ಲೇಖ ಮತ್ತು ಇಮೋಜಿ',
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
    },
});

// Configure i18n
i18n.locale = Localization.locale;
i18n.enableFallback = true; // Updated property name

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [chatVisible, setChatVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [lang, setLang] = useState('en');

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

    const theme = {
        background: isDarkMode ? '#000000' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#000000',
        secondaryText: isDarkMode ? '#D3D3D3' : '#A18249',
        card: isDarkMode ? '#2A2216' : '#F4EFE6',
        progressTrack: isDarkMode ? '#3A2F23' : '#E9DFCE',
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar backgroundColor={theme.background} barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <List size={24} color={theme.text} weight="regular" />
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

                {/* Quote Section */}
                <View style={styles.quoteSection}>
                    <View style={styles.quoteTextContainer}>
                        <Text style={[styles.quoteTitle, { color: theme.text }]}>{i18n.t('quote')}</Text>
                        <Text style={[styles.quoteSubtitle, { color: theme.secondaryText }]}>
                            {i18n.t('quoteSubtitle')}
                        </Text>
                    </View>
                </View>

                {/* Reminders Section */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('reminders')}</Text>

                {[1, 2].map((item) => (
                    <View style={styles.reminderItem} key={item}>
                        <View style={styles.reminderContent}>
                            <View style={[styles.reminderIconContainer, { backgroundColor: theme.card }]}>
                                <Bell size={24} color={theme.text} weight="regular" />
                            </View>
                            <View style={styles.reminderTextContainer}>
                                <Text style={[styles.reminderTitle, { color: theme.text }]}>{i18n.t('reminder')} {item}</Text>
                                <Text style={[styles.reminderDetails, { color: theme.secondaryText }]}>
                                    {i18n.t('details')} {item}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <PencilSimple size={24} color={theme.text} weight="regular" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Progress Section */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('progress')}</Text>

                {/* Steps Progress */}
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>{i18n.t('steps')}</Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.progressTrack }]}>
                        <View style={[styles.progressBar, { width: '75%' }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>{i18n.t('stepsProgress')}</Text>
                </View>

                {/* Exercise Progress */}
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>{i18n.t('exercise')}</Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.progressTrack }]}>
                        <View style={[styles.progressBar, { width: '50%' }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>{i18n.t('exerciseProgress')}</Text>
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <View style={[styles.navBar, { borderTopColor: theme.card, backgroundColor: theme.background }]}>
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

            {/* Chatbot Floating Button */}
            <TouchableOpacity
                style={styles.chatbotButton}
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
                    <View style={[styles.chatModal, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('chatbot')}</Text>
                            <TouchableOpacity onPress={() => setChatVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.chatInputContainer}>
                            <TextInput
                                style={[styles.textInput, { color: theme.text, borderColor: theme.progressTrack }]}
                                placeholder={i18n.t('typeMessage')}
                                placeholderTextColor={theme.secondaryText}
                                value={message}
                                onChangeText={setMessage}
                            />
                            <TouchableOpacity onPress={() => setMessage('')}>
                                <PaperPlaneRight size={24} color={theme.text} />
                            </TouchableOpacity>
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
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    quoteSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        padding: 16,
        gap: 16,
    },
    quoteTextContainer: {
        flex: 2,
        flexDirection: 'column',
        gap: 4,
    },
    quoteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quoteSubtitle: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingBottom: 12,
        paddingTop: 20,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 72,
    },
    reminderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
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
        padding: 16,
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
        backgroundColor: '#019863',
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
        bottom: 80,
        right: 20,
        backgroundColor: '#019863',
        padding: 14,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    chatModal: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    chatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#ccc',
        paddingTop: 12,
        gap: 8,
    },
    textInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
});

export default App;
