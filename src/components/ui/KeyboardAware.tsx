import {
  createContext,
  ReactNode,
  Ref,
  useCallback,
  useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

/*
 * Keyboard handling shared by every screen with inputs.
 *
 * Android runs edge-to-edge (gradle.properties `edgeToEdgeEnabled=true`), so
 * `windowSoftInputMode="adjustResize"` no longer shrinks the window: the
 * keyboard is drawn over the app and the app has to make room itself. iOS
 * never resizes. So on both platforms we measure where this view sits in the
 * window and pad its bottom by however much of it the keyboard covers.
 *
 * iOS sends `keyboardWill*` with the keyboard's own duration/easing, so the
 * padding moves together with the keyboard. Android only sends `keyboardDid*`
 * (after the keyboard finished animating), so the padding eases in quickly.
 */

const IOS = Platform.OS === "ios";
const SHOW_EVENT = IOS ? "keyboardWillShow" : "keyboardDidShow";
const HIDE_EVENT = IOS ? "keyboardWillHide" : "keyboardDidHide";

/** Space left between the focused input and the top of the keyboard. */
const FOCUS_MARGIN = 24;

function animateLayout(event?: KeyboardEvent) {
  LayoutAnimation.configureNext(
    IOS
      ? { duration: event?.duration || 250, update: { type: LayoutAnimation.Types.keyboard } }
      : { duration: 180, update: { type: LayoutAnimation.Types.easeInEaseOut } }
  );
}

const KeyboardInsetContext = createContext(0);

/**
 * How much the keyboard covers the nearest `KeyboardAvoidingBox` (0 when
 * closed). Children use it to drop their safe-area bottom padding while the
 * keyboard is open; it updates in the same layout pass as the box padding, so
 * both animate together.
 */
export function useKeyboardInset() {
  return useContext(KeyboardInsetContext);
}

type BoxProps = {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** Called after the keyboard padding changed (with the new padding). */
  onInsetChange?: (inset: number) => void | (() => void);
};

/**
 * Replacement for `KeyboardAvoidingView behavior="padding"` that also works on
 * Android edge-to-edge and inside iOS modal sheets (it measures in window
 * coordinates instead of trusting its parent offset).
 */
export function KeyboardAvoidingBox({ style, children, onInsetChange }: BoxProps) {
  const ref = useRef<View>(null);
  const keyboardTop = useRef<number | null>(null);
  const insetRef = useRef(0);
  const [inset, setInset] = useState(0);

  const update = useCallback((event?: KeyboardEvent) => {
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, y, _width, height) => {
      const kbTop = keyboardTop.current;
      const next = kbTop === null ? 0 : Math.max(Math.round(y + height - kbTop), 0);
      if (insetRef.current === next) return;
      insetRef.current = next;
      animateLayout(event);
      setInset(next);
    });
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      update(event);
    });
    const hide = Keyboard.addListener(HIDE_EVENT, (event) => {
      keyboardTop.current = null;
      update(event);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [update]);

  useEffect(() => onInsetChange?.(inset) ?? undefined, [inset, onInsetChange]);

  return (
    <View
      ref={ref}
      style={[styles.fill, style, { paddingBottom: inset }]}
      // Re-measure if the box moves (rotation, header resize) while the keyboard is open.
      onLayout={() => keyboardTop.current !== null && update()}
    >
      <KeyboardInsetContext.Provider value={inset}>{children}</KeyboardInsetContext.Provider>
    </View>
  );
}

type ScrollProps = ScrollViewProps & {
  /** Style of the outer box that receives the keyboard padding (background, etc.). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Rendered under the scroll area, kept above the keyboard (sticky CTA). */
  footer?: ReactNode;
  ref?: Ref<ScrollView | null>;
};

/**
 * Scrolling form screen: makes room for the keyboard and keeps the focused
 * input visible above it. Use it instead of `KeyboardAvoidingView` +
 * `ScrollView` on any screen with text fields.
 */
export function KeyboardAwareScrollView({
  containerStyle,
  footer,
  children,
  ref,
  onScroll,
  onLayout,
  ...scrollProps
}: ScrollProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const viewportHeight = useRef(0);
  const pendingReveal = useRef(false);

  useImperativeHandle(ref, () => scrollRef.current as ScrollView);

  const revealFocusedInput = useCallback(() => {
    const scroll = scrollRef.current;
    const input = TextInput.State.currentlyFocusedInput();
    // `getInnerViewRef` exists at runtime but is missing from the TS types.
    const content = (scroll as (ScrollView & { getInnerViewRef(): View | null }) | null)?.getInnerViewRef();
    if (!scroll || !input || !content) return;
    input.measureLayout(
      content,
      (_x, y, _width, height) => {
        const visibleBottom = scrollY.current + viewportHeight.current;
        const inputBottom = y + height + FOCUS_MARGIN;
        if (inputBottom > visibleBottom) {
          // Never scroll the input's top out of view on very short viewports.
          const target = Math.min(inputBottom - viewportHeight.current, y - FOCUS_MARGIN);
          scroll.scrollTo({ y: Math.max(target, scrollY.current), animated: true });
        }
      },
      () => {}
    );
  }, []);

  const handleInsetChange = useCallback(
    (inset: number) => {
      if (inset === 0) return;
      // The viewport reaches its final height on the next layout pass; reveal
      // there, with a timer as fallback in case the height did not change.
      pendingReveal.current = true;
      const timer = setTimeout(() => {
        if (!pendingReveal.current) return;
        pendingReveal.current = false;
        revealFocusedInput();
      }, 350);
      return () => clearTimeout(timer);
    },
    [revealFocusedInput]
  );

  return (
    <KeyboardAvoidingBox style={containerStyle} onInsetChange={handleInsetChange}>
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        {...scrollProps}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollY.current = event.nativeEvent.contentOffset.y;
          onScroll?.(event);
        }}
        onLayout={(event: LayoutChangeEvent) => {
          viewportHeight.current = event.nativeEvent.layout.height;
          if (pendingReveal.current) {
            pendingReveal.current = false;
            requestAnimationFrame(revealFocusedInput);
          }
          onLayout?.(event);
        }}
      >
        {children}
      </ScrollView>
      {footer}
    </KeyboardAvoidingBox>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
