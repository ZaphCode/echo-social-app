import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useTheme from "@/hooks/useTheme";
import { radius, space } from "@/theme/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/** Height of the on-screen keyboard while it is open (0 when closed). */
function useKeyboardHeight(enabled: boolean) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const ios = Platform.OS === "ios";
    const animate = (event?: KeyboardEvent) =>
      LayoutAnimation.configureNext({
        duration: event?.duration || 250,
        update: { type: LayoutAnimation.Types.keyboard },
      });

    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", (event) => {
      if (ios) animate(event);
      setHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", (event) => {
      if (ios) animate(event);
      setHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
      setHeight(0);
    };
  }, [enabled]);

  return height;
}

/**
 * Bottom sheet for every form-in-a-modal (solicitar, ofertar, valorar...).
 * Sized from the window instead of the native modal frame, and lifts itself
 * over the keyboard: KeyboardAvoidingView mis-measures inside iOS modals.
 */
export function SlideModal({ visible, onClose, children }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(height)).current;
  const [mounted, setMounted] = useState(visible);
  const keyboard = useKeyboardHeight(mounted);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(translateY, {
      toValue: visible ? 0 : height,
      duration: visible ? 320 : 240,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, height, translateY]);

  const bottomPadding = keyboard > 0 ? space.md : Math.max(insets.bottom, space.md) + space.xs;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.root, { width, height }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              marginBottom: keyboard,
              maxHeight: height - keyboard - insets.top - space.sm,
              paddingBottom: bottomPadding,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.surface3 }]} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "flex-end",
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    marginBottom: space.md,
  },
});
