/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    mode : "light",
    text: '#11181C',
    reverseText: '#ECEDEE',
    background: '#f5f5f5',
    Softbackground: '#fff',
    reverseBackground: '#151718',
    tint: tintColorLight,
    reverseTint: tintColorDark,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    mode : "dark",
    text: '#ECEDEE',
    reverseText: '#11181C',
    background: '#121212',
    // background: '#0d0d0d',
    Softbackground: '#151718',
    reverseBackground: '#fff',
    tint: tintColorDark,
    reverseTint: tintColorLight,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    TabSeleccionado: 'black',
  },
};
