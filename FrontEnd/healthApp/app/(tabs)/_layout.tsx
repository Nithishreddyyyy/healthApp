import { View, Text, Image, Dimensions, Platform } from 'react-native';
import React from 'react';
import { Tabs } from "expo-router";
import { icons } from "@/constants/icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Get device width
const { width } = Dimensions.get('window');

// Properly typed TabIcon component
interface TabIconProps {
    focused: boolean;
    icon: any;
    title: string;
    badgeCount?: number;
}

const TabIcon = ({ focused, icon, title, badgeCount }: TabIconProps) => {
    return (
        <View className="items-center justify-center">
            <View className={`${focused ? 'bg-[#1A1A2E] rounded-full p-2' : ''}`}>
                <Image 
                    source={icon} 
                    tintColor={focused ? "#FFFFFF" : "#A8B5DB"} 
                    className="size-5" 
                />
                
                {badgeCount ? (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-4 h-4 flex items-center justify-center">
                        <Text className="text-white text-xs font-bold">{badgeCount > 99 ? '99+' : badgeCount}</Text>
                    </View>
                ) : null}
            </View>
            
            <Text className={`text-xs ${focused ? 'text-white font-medium' : 'text-gray-400'}`}>
                {title}
            </Text>
        </View>
    );
}

const _Layout = () => {
    const insets = useSafeAreaInsets();
    
    // Calculate minimal padding needed for bottom insets
    const safeBottomPadding = Platform.OS === 'ios' ? insets.bottom : 0;
    
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: '#0f0D23',
                    width: width,
                    marginHorizontal: 0,
                    marginBottom: 0,
                    // Reduced height - just enough for icons, text and safe area
                    height: 60 + safeBottomPadding,
                    position: 'absolute',
                    borderTopWidth: 1,
                    borderTopColor: '#1f1d33',
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 8,
                    paddingBottom: safeBottomPadding,
                    paddingTop: 8,
                },
                // Common header settings
                headerShown: false,
                // Add bottom padding to content to prevent tab bar overlap
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.home}
                            title="Home"
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Exercise"
                options={{
                    title: 'Exercise',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.exercise}
                            title="Exercise"
                        />
                    ),
                    unmountOnBlur: true,
                }}
            />
            <Tabs.Screen
                name="Reminder"
                options={{
                    title: 'Reminder',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.reminder}
                            title="Reminder"
                            badgeCount={2}
                        />
                    ),
                    unmountOnBlur: false,
                }}
            />
            <Tabs.Screen
                name="Utilities"
                options={{
                    title: 'Utilities',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.Utilities}
                            title="Utilities"
                        />
                    ),
                    lazy: true,
                }}
            />
            <Tabs.Screen
                name="Emergency"
                options={{
                    title: 'Emergency',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.emergency}
                            title="Emergency"
                        />
                    ),
                    lazy: false,
                }}
            />
        </Tabs>
    );
}

export default _Layout;