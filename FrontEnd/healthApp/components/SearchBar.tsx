import {View, TextInput, Image} from 'react-native';
import React from 'react';
import {icons} from "@/constants/icons";

const Searchbar= () => {
    return (
             <Image source={icons.search} className="size-5" resizeMode="contain" tintColor="#A8B5DB" />
    )
}
export default Searchbar;
