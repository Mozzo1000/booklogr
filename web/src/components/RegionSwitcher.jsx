import { Dropdown, DropdownItem } from 'flowbite-react'; 
import { useState } from 'react';

function RegionSwitcher() {
    const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('region') || navigator.language || 'en-GB');

    const availableRegions = [
        { code: 'en-US', name: 'United States', flag: '🇺🇸' },
        { code: 'en-GB', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'sv-SE', name: 'Sverige', flag: '🇸🇪'},
        { code: 'en-CA', name: 'Canada', flag: '🇨🇦' },
        { code: 'es-ES', name: 'España', flag: '🇪🇸' },
        { code: 'es-MX', name: 'México', flag: '🇲🇽' },
        { code: 'fr-FR', name: 'France', flag: '🇫🇷' },
        { code: 'de-DE', name: 'Deutschland', flag: '🇩🇪' },
        { code: 'it-IT', name: 'Italia', flag: '🇮🇹' },
        { code: 'pt-BR', name: 'Brasil', flag: '🇧🇷' },
        { code: 'nl-NL', name: 'Nederland', flag: '🇳🇱'},
    ];

    const currentRegion = availableRegions.find(r => r.code === selectedRegion);

    const changeRegion = (reg) => {
        setSelectedRegion(reg)
        localStorage.setItem("region", reg)
    }

    return (
        <Dropdown label={currentRegion.flag + " " + currentRegion.name} color={'alternative'} className="max-h-48 overflow-y-auto">
            {availableRegions.map(({ code, name, flag }) => (
                <DropdownItem key={code} onClick={() => changeRegion(code)}>
                    {flag} {name}
                </DropdownItem>
            ))}
        </Dropdown>
    )
}

export default RegionSwitcher