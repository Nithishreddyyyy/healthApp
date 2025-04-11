import {View, Text, ImageBackground, Image} from 'react-native';
import React from 'react'
import {Tabs} from "expo-router"
import {images} from "@/constants/images"
import {icons} from "@/constants/icons"

const TabIcon = ({ focused, icon, title}:any) => {
    if(focused){
        return(
            <ImageBackground
                source={images.highlight}
                className="flex-row w-full min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden"
            >
                <Image source ={icon} tintColor="#151312" className="size-5" />
                <Text className="text-secondary text-base font-semibold ml-2">{title}</Text>
            </ImageBackground>
        )
    }
    return(
        <View className="size-full justify-center items-center">
            <Image source={icon} tintColor="#A8B5DB" className="size-5" />
        </View>
    )

}

const _Layout = () =>{
    return(
        <Tabs
            screenOptions={{
            tabBarShowLabel:false,
            tabBarItemStyle: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            },
            tabBarStyle:{
                backgroundColor:'#0f0D23',
                borderRadius:50,
                marginHorizontal:20,
                marginBottom:36,
                height:52,
                position:'absolute',
                overflow:'hidden',
                borderWidth:1,
                borderColor:'0f0d23'
            }
        }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title : 'Home',
                    headerShown: false,
                    tabBarIcon:({ focused }) => (
                        <>
                            <TabIcon
                                focused={focused}
                                icon={icons.home}
                                title="Home"
                            />
                        </>
                    )
                }}
            />
            <Tabs.Screen
                name="Exercise"
                options={{
                    title : 'Exercise',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.exercise}
                            title="Exercise"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="Reminder"
                options={{
                    title : 'Reminder',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.reminder}
                            title="Reminder"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="Utilities"
                options={{
                    title : 'Utilities',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.Utilities}
                            title="Utilities"
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="Emergency"
                options={{
                    title : 'Emergency',
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.emergency}
                            title="Emergency"
                        />
                    )
                }}
            />
        </Tabs>
    )
}
export default _Layout;
