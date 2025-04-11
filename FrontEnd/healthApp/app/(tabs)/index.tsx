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
    ChatCircleDots,
    X,
    PaperPlaneRight
} from 'phosphor-react-native';

const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [chatVisible, setChatVisible] = useState(false);
    const [message, setMessage] = useState('');

    const theme = {
        background: isDarkMode ? '#1C160C' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#1C160C',
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Welcome!</Text>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
                        <Moon size={24} color={theme.text} weight="regular" />
                    </TouchableOpacity>
                </View>

                {/* Quote Section */}
                <View style={styles.quoteSection}>
                    <View style={styles.quoteTextContainer}>
                        <Text style={[styles.quoteTitle, { color: theme.text }]}>Quote</Text>
                        <Text style={[styles.quoteSubtitle, { color: theme.secondaryText }]}>
                            Inspirational quote with emoji
                        </Text>
                    </View>
                </View>

                {/* Reminders Section */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Reminders</Text>

                {[1, 2].map((item) => (
                    <View style={styles.reminderItem} key={item}>
                        <View style={styles.reminderContent}>
                            <View style={[styles.reminderIconContainer, { backgroundColor: theme.card }]}>
                                <Bell size={24} color={theme.text} weight="regular" />
                            </View>
                            <View style={styles.reminderTextContainer}>
                                <Text style={[styles.reminderTitle, { color: theme.text }]}>Reminder {item}</Text>
                                <Text style={[styles.reminderDetails, { color: theme.secondaryText }]}>
                                    Details about reminder {item}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <PencilSimple size={24} color={theme.text} weight="regular" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Progress Section */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Progress</Text>

                {/* Steps Progress */}
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>Steps</Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.progressTrack }]}>
                        <View style={[styles.progressBar, { width: '75%' }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>7,500/10,000 steps</Text>
                </View>

                {/* Exercise Progress */}
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>Exercise</Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: theme.progressTrack }]}>
                        <View style={[styles.progressBar, { width: '50%' }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.secondaryText }]}>30/60 minutes</Text>
                </View>
            </ScrollView>

            {/* Navigation Bar */}
            <View style={[styles.navBar, { borderTopColor: theme.card, backgroundColor: theme.background }]}>
                <TouchableOpacity style={styles.navItem}>
                    <House size={24} color={theme.text} weight="fill" />
                    <Text style={[styles.navTextActive, { color: theme.text }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <ChartLine size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <ChartLine size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Note size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>Reminders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Gear size={24} color={theme.secondaryText} weight="regular" />
                    <Text style={[styles.navTextInactive, { color: theme.secondaryText }]}>Settings</Text>
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
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Chatbot</Text>
                            <TouchableOpacity onPress={() => setChatVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.chatInputContainer}>
                            <TextInput
                                style={[styles.textInput, { color: theme.text, borderColor: theme.progressTrack }]}
                                placeholder="Type a message..."
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    iconButton: {
        width: 48,
        alignItems: 'flex-end',
        justifyContent: 'center',
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
