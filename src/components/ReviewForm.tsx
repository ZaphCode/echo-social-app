import { StyleSheet, View, Text as RNText } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNotification, notificationsKeys } from "@/api/notifications";
import { createReview, reviewsKeys } from "@/api/reviews";
import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import { useAlertCtx } from "@/context/Alert";
import Text from "./ui/Text";
import Divider from "./ui/Divider";
import Field from "./forms/Field";
import Button from "./ui/Button";
import StarRatingField from "./forms/StarRatingField";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  onSuccess?: () => void;
};

export default function ReviewForm({ onSuccess }: Props) {
  const { user: authUser } = useAuthCtx();
  const { colors } = useColorScheme();
  const { request, client, provider, subject } = useNegotiationCtx();
  const { show } = useAlertCtx();
  const queryClient = useQueryClient();

  const theOther =
    subject.type === "contracting"
      ? provider
      : authUser.id === client.id
        ? provider
        : client;
  const reviewType =
    subject.type === "contracting"
      ? "AS_CLIENT"
      : authUser.id === client.id
        ? "AS_CLIENT"
        : "AS_PROVIDER";
  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          subject.type === "service"
            ? reviewsKeys.byService(subject.id)
            : reviewsKeys.byReviewerAndContracting(authUser.id, subject.id),
      });
      queryClient.invalidateQueries({
        queryKey:
          subject.type === "service"
            ? reviewsKeys.byReviewerAndService(authUser.id, subject.id)
            : reviewsKeys.byReviewerAndContracting(authUser.id, subject.id),
      });
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.byReviewedUser(theOther.id),
      });
    },
  });
  const notificationMutation = useMutation({
    mutationFn: createNotification,
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await reviewMutation.mutateAsync({
        service: subject.type === "service" ? subject.id : undefined,
        contracting: subject.type === "contracting" ? subject.id : undefined,
        request: request.id,
        reviewer: authUser.id,
        reviewed: theOther.id,
        rating: data.rating,
        comment: data.comment,
        type: reviewType,
      });
    } catch {
      return show({
        title: "Error al enviar la valoración",
        message:
          "Lo sentimos. No se pudo enviar tu valoración. Por favor, inténtalo de nuevo más tarde.",
        icon: "alert",
        iconColor: theme.colors.redError,
      });
    }

    try {
      await notificationMutation.mutateAsync({
        user: theOther.id,
        message: `*${authUser.name}* dejó una valoración para *${subject.name}*`,
        type: "SYSTEM:INFO",
        read: false,
        request: request.id,
        service: subject.type === "service" ? subject.id : undefined,
        contracting: subject.type === "contracting" ? subject.id : undefined,
      });
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.byUser(theOther.id),
      });
      queryClient.invalidateQueries({
        queryKey: notificationsKeys.unreadCount(theOther.id),
      });
    } catch (err) {
      console.log("Failed to create review notification:", err);
    }

    onSuccess?.();
  });

  return (
    <View style={styles.container}>
      <Text color={colors.text} style={styles.title}>
        Deja tu Valoración
      </Text>
      <RNText style={styles.descContainer}>
        <Text>{`Por favor, comparte tu experiencia al tratar con `}</Text>
        <Text color={theme.colors.primaryBlue}>{theOther.name}</Text>
        <Text>
          {
            " durante el proceso de negociación o en la prestación del servicio."
          }
        </Text>
      </RNText>
      <Divider />
      <View>
        <StarRatingField control={control} name="rating" label="Valoración" />
        <Field
          name="comment"
          control={control}
          label="Comentarios"
          placeholder="Que te pareció el trato?"
          icon="user"
          rules={{ required: false }}
        />
        <Button
          title="Enviar Valoración"
          onPress={onSubmit}
          loading={reviewMutation.isPending}
          style={{ marginTop: theme.spacing.lg + 6 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    textAlign: "center",
  },
  descContainer: {
    gap: theme.spacing.sm,
  },
});
