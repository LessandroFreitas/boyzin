import { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configura como as notificações são tratadas quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,    // Substitui o shouldShowAlert
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,      // Adiciona esta linha
  }),
});

export default function SuaTela() {
  useEffect(() => {
    // Pede permissão para notificações quando o app inicia
    const pedirPermissao = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Você não receberá notificações!');
      }
    };
    pedirPermissao();
  }, []);

  // Função para agendar uma notificação local
  const agendarNotificacaoLocal = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Notificação de Teste!",
        body: 'Esta é uma notificação local do seu app.',
        sound: 'default', // Som padrão
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2, // Dispara após 2 segundos
      },
    });
  };

  // Função para notificação com data específica
  const agendarNotificacaoData = async () => {
    const data = new Date();
    data.setMinutes(data.getMinutes() + 1); // 1 minuto a partir de agora

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lembrete!",
        body: 'Esta notificação foi agendada para um horário específico.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: data,
      },
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button 
        title="Notificação em 2 segundos" 
        onPress={agendarNotificacaoLocal} 
      />
      <View style={{ marginTop: 10 }} />
      <Button 
        title="Notificação em 1 minuto" 
        onPress={agendarNotificacaoData} 
      />
    </View>
  );
}