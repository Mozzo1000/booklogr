import React, { useState } from 'react'
import { Dropdown, DropdownItem } from 'flowbite-react'; 

function TimezoneSwitcher() {
    const [selectedTimezone, setSelectedTimezone] = useState(localStorage.getItem("timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")

    const timezones = [
        {zone: "Pacific/Midway", name: "Midway Island, Samoa"},
        {zone: "Pacific/Honolulu", name: "Hawaii"},
        {zone: "America/Juneau", name: "Alaska"},
        {zone: "America/Boise", name: "Mountain Time"},
        {zone: "America/Dawson", name: "Dawson, Yukon"},
        {zone: "America/Chihuahua", name: "Chihuahua, La Paz, Mazatlan"},
        {zone: "America/Phoenix", name: "Arizona"},
        {zone: "America/Chicago", name: "Central Time"},
        {zone: "America/Regina", name: "Saskatchewan"},
        {zone: "America/Mexico_City", name: "Guadalajara, Mexico City, Monterrey"},
        {zone: "America/Belize", name: "Central America"},
        {zone: "America/Detroit", name: "Eastern Time"},
        {zone: "America/Bogota", name: "Bogota, Lima, Quito"},
        {zone: "America/Caracas", name: "Caracas, La Paz"},
        {zone: "America/Santiago", name: "Santiago"},
        {zone: "America/St_Johns", name: "Newfoundland and Labrador"},
        {zone: "America/Sao_Paulo", name: "Brasilia"},
        {zone: "America/Tijuana", name: "Tijuana"},
        {zone: "America/Montevideo", name: "Montevideo"},
        {zone: "America/Argentina/Buenos_Aires", name: "Buenos Aires, Georgetown"},
        {zone: "America/Godthab", name: "Greenland"},
        {zone: "America/Los_Angeles", name: "Pacific Time"},
        {zone: "Atlantic/Azores", name: "Azores"},
        {zone: "Atlantic/Cape_Verde", name: "Cape Verde Islands"},
        {zone: "UTC", name: "UTC"},
        {zone: "Europe/London", name: "Edinburgh, London"},
        {zone: "Europe/Dublin", name: "Dublin"},
        {zone: "Europe/Lisbon", name: "Lisbon"},
        {zone: "Africa/Casablanca", name: "Casablanca, Monrovia"},
        {zone: "Atlantic/Canary", name: "Canary Islands"},
        {zone: "Europe/Belgrade", name: "Belgrade, Bratislava, Budapest, Ljubljana, Prague"},
        {zone: "Europe/Sarajevo", name: "Sarajevo, Skopje, Warsaw, Zagreb"},
        {zone: "Europe/Brussels", name: "Brussels, Copenhagen, Madrid, Paris"},
        {zone: "Europe/Amsterdam", name: "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna"},
        {zone: "Africa/Algiers", name: "West Central Africa"},
        {zone: "Europe/Bucharest", name: "Bucharest"},
        {zone: "Africa/Cairo", name: "Cairo"},
        {zone: "Europe/Helsinki", name: "Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius"},
        {zone: "Europe/Athens", name: "Athens"},
        {zone: "Asia/Jerusalem", name: "Jerusalem"},
        {zone: "Africa/Harare", name: "Harare, Pretoria"},
        {zone: "Europe/Moscow", name: "Istanbul, Minsk, Moscow, St. Petersburg, Volgograd"},
        {zone: "Asia/Kuwait", name: "Kuwait, Riyadh"},
        {zone: "Africa/Nairobi", name: "Nairobi"},
        {zone: "Asia/Baghdad", name: "Baghdad"},
        {zone: "Asia/Tehran", name: "Tehran"},
        {zone: "Asia/Dubai", name: "Abu Dhabi, Muscat"},
        {zone: "Asia/Baku", name: "Baku, Tbilisi, Yerevan"},
        {zone: "Asia/Kabul", name: "Kabul"},
        {zone: "Asia/Yekaterinburg", name: "Ekaterinburg"},
        {zone: "Asia/Karachi", name: "Islamabad, Karachi, Tashkent"},
        {zone: "Asia/Kolkata", name: "Chennai, Kolkata, Mumbai, New Delhi"},
        {zone: "Asia/Kathmandu", name: "Kathmandu"},
        {zone: "Asia/Dhaka", name: "Astana, Dhaka"},
        {zone: "Asia/Colombo", name: "Sri Jayawardenepura"},
        {zone: "Asia/Almaty", name: "Almaty, Novosibirsk"},
        {zone: "Asia/Rangoon", name: "Yangon Rangoon"},
        {zone: "Asia/Bangkok", name: "Bangkok, Hanoi, Jakarta"},
        {zone: "Asia/Krasnoyarsk", name: "Krasnoyarsk"},
        {zone: "Asia/Shanghai", name: "Beijing, Chongqing, Hong Kong SAR, Urumqi"},
        {zone: "Asia/Kuala_Lumpur", name: "Kuala Lumpur, Singapore"},
        {zone: "Asia/Taipei", name: "Taipei"},
        {zone: "Australia/Perth", name: "Perth"},
        {zone: "Asia/Irkutsk", name: "Irkutsk, Ulaanbaatar"},
        {zone: "Asia/Seoul", name: "Seoul"},
        {zone: "Asia/Tokyo", name: "Osaka, Sapporo, Tokyo"},
        {zone: "Asia/Yakutsk", name: "Yakutsk"},
        {zone: "Australia/Darwin", name: "Darwin"},
        {zone: "Australia/Adelaide", name: "Adelaide"},
        {zone: "Australia/Sydney", name: "Canberra, Melbourne, Sydney"},
        {zone: "Australia/Brisbane", name: "Brisbane"},
        {zone: "Australia/Hobart", name: "Hobart"},
        {zone: "Asia/Vladivostok", name: "Vladivostok"},
        {zone: "Pacific/Guam", name: "Guam, Port Moresby"},
        {zone: "Asia/Magadan", name: "Magadan, Solomon Islands, New Caledonia"},
        {zone: "Asia/Kamchatka", name: "Kamchatka, Marshall Islands"},
        {zone: "Pacific/Fiji", name: "Fiji Islands"},
        {zone: "Pacific/Auckland", name: "Auckland, Wellington"},
        {zone: "Pacific/Tongatapu", name: "Nuku'alofa"},
    ]

    const changeTimezone = (zone) => {
        setSelectedTimezone(zone);
        localStorage.setItem("timezone", zone);
    }

    return (
        <Dropdown label={selectedTimezone} color={'alternative'} className="max-h-48 overflow-y-auto">
            {timezones.map(({zone, name}) => (
                <DropdownItem key={zone} onClick={() => changeTimezone(zone)}>
                    {zone} ({name})
                </DropdownItem>
            ))}
        </Dropdown>
    )
}

export default TimezoneSwitcher