import { Menu, MenuButton, Button, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { SUPPORTED_TRANSLATION_CODES, LANGUAGE_NAMES } from './supportedTranslationLanguages';

export const SupportedLanguagesMenu = ({ currentLang, onLangClick, disabled }) => {
  const currentLanguageName = LANGUAGE_NAMES[currentLang];

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        disabled={disabled}
        ariaLabel={`Translate summary from ${currentLanguageName}`}
        border='1px solid black'
        borderRadius='0'
        bg='#fff'
      >
        {currentLanguageName}
      </MenuButton>
      <MenuList maxHeight='400px' overflow='auto'>
        {SUPPORTED_TRANSLATION_CODES.map((code) => (
          <MenuItem key={code} onClick={() => onLangClick(code)} fontSize='1rem'>
            {LANGUAGE_NAMES[code]}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
