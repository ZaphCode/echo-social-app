import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNotification, notificationsKeys } from "@/api/notifications";
import { createReview, reviewsKeys } from "@/api/reviews";
import { useAlertCtx } from "@/context/Alert";
import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import useTheme from "@/hooks/useTheme";
import EchoRings from "./ui/EchoRings";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import Text from "./ui/Text";
import Field from "./forms/Field";
import StarRatingField from "./forms/StarRatingField";

type Props = {
  onSuccess?: () => void;
};

export default function ReviewForm({ onSuccess }: Props) {
  const { user: authUser } = useAuthCtx();
  const { colors } = useTheme();
  const { request, client, provider, subject } = useNegotiationCtx();
  const { show } = useAlertCtx();
  const queryClient = useQueryClient();

  const isClientSide = subject.type === "contracting" || authUser.id === client.id;
  const theOther = isClientSide ? provider : client;
  const reviewType = isClientSide ? "AS_CLIENT" : "AS_PROVIDER";

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
      queryClient.invalidateQueries({ queryKey: reviewsKeys.byReviewedUser(theOther.id) });
    },
  });
  const notificationMutation = useMutation({ mutationFn: createNotification });

  const { control, handleSubmit } = useForm({
    defaultValues: { rating: 0, comment: "" },
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
        title: "No se pudo enviar",
        message: "Tu valoración no se guardó. Inténtalo de nuevo más tarde.",
        icon: "alert",
        iconColor: colors.danger,
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
      queryClient.invalidateQueries({ queryKey: notificationsKeys.byUser(theOther.id) });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount(theOther.id) });
    } catch (err) {
      console.log("Failed to create review notification:", err);
    }

    onSuccess?.();
  });

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <EchoRings size={150} style={styles.rings} />
        <Avatar name={theOther.name} path={theOther.avatar} size={72} ring />
      </View>
      <View style={styles.copy}>
        <Text variant="title" align="center">
          {`¿Cómo te fue con ${theOther.name?.split(" ")[0] ?? "esta persona"}?`}
        </Text>
        <Text tone="muted" align="center">
          {`Tu reseña sobre “${subject.name}” ayuda a otros a decidir.`}
        </Text>
      </View>
      <StarRatingField control={control} name="rating" />
      <Field
        name="comment"
        control={control}
        label="Comentario (opcional)"
        placeholder="Puntualidad, calidad, trato…"
        autoCapitalize="sentences"
        multiline
        rules={{ required: false }}
      />
      <Button title="Publicar valoración" onPress={onSubmit} loading={reviewMutation.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  hero: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  rings: {
    position: "absolute",
  },
  copy: {
    gap: 6,
  },
});
