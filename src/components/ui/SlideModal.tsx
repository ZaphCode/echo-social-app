import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { theme } from "@/theme/theme";

type BottomUpModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function SlideModal({ visible, onClose, children }: BottomUpModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 300,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        tvParallaxShiftDistanceY={10000}
        style={styles.keyboardAvoiding}
      > */}
      <Animated.View
        style={[
          styles.modalContentWrapper,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.modalContent}>{children}</View>
      </Animated.View>
      {/* </KeyboardAvoidingView> */}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  keyboardAvoiding: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContentWrapper: {
    width: "100%",
  },
  modalContent: {
    backgroundColor: theme.colors.darkerGray,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    width: "100%",
  },
});
