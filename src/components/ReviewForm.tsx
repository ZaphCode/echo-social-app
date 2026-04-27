import { StyleSheet, View, Text as RNText } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const { client, provider, service } = useNegotiationCtx();
  const { show } = useAlertCtx();
  const queryClient = useQueryClient();

  const theOther = authUser.id === client.id ? provider : client;
  const reviewType = authUser.id === client.id ? "AS_CLIENT" : "AS_PROVIDER";
  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.byService(service.id),
      });
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.byReviewerAndService(authUser.id, service.id),
      });
      queryClient.invalidateQueries({
        queryKey: reviewsKeys.byReviewedUser(theOther.id),
      });
    },
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
        service: service.id,
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
