import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Toast } from "sonner-native";

const { width } = Dimensions.get("window");
const COMMISSION_FEE = 1;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TicketSwapApp = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      event: "Taylor Swift Concert",
      date: "2025-03-15",
      price: 150,
      location: "Madrid Arena",
      seller: "Maria G.",
      available: true,
    },
    {
      id: 2,
      event: "Real Madrid vs Barcelona",
      date: "2025-03-20",
      price: 80,
      location: "Santiago Bernabéu",
      seller: "Carlos R.",
      available: true,
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTicket, setNewTicket] = useState({
    event: "",
    date: "",
    price: "",
    location: "",
  });

  const validateTicketData = () => {
    if (!newTicket.event.trim()) {
      Toast.error("Por favor ingresa el nombre del evento");
      return false;
    }
    if (!newTicket.date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(newTicket.date)) {
      Toast.error("Por favor ingresa una fecha válida (YYYY-MM-DD)");
      return false;
    }
    if (!newTicket.location.trim()) {
      Toast.error("Por favor ingresa la ubicación");
      return false;
    }
    if (!newTicket.price || isNaN(newTicket.price) || parseFloat(newTicket.price) <= 0) {
      Toast.error("Por favor ingresa un precio válido");
      return false;
    }
    return true;
  };

  const addNewTicket = useCallback(async () => {
    if (!validateTicketData()) return;
    
    setLoading(true);
    try {
      // Simulamos una carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTickets(prev => [{
        id: prev.length + 1,
        ...newTicket,
        seller: "You",
        price: parseFloat(newTicket.price),
        available: true,
      }, ...prev]);
      
      Toast.success("Entrada publicada con éxito");
      setModalVisible(false);
      setNewTicket({ event: "", date: "", price: "", location: "" });
    } catch (error) {
      Toast.error("Error al publicar la entrada");
    } finally {
      setLoading(false);
    }
  }, [newTicket]);

  const handleBuyTicket = useCallback(async (ticketId) => {
    setLoading(true);
    try {
      const ticket = tickets.find((t) => t.id === ticketId);
      const totalPrice = ticket.price + COMMISSION_FEE;
      
      // Simulamos proceso de compra
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTickets(prev => 
        prev.map(t => t.id === ticketId ? {...t, available: false} : t)
      );
      
      Toast.success(`¡Compra exitosa! Total pagado: ${totalPrice}€`);
    } catch (error) {
      Toast.error("Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  }, [tickets]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#007AFF", "#00C6FF"]}
        style={styles.header}>
        <Text style={styles.headerTitle}>Ticket Exchange</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.addButtonText}>Vender Entrada</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.ticketList}>
        {tickets.map((ticket, index) => (
          <AnimatedTouchableOpacity
            key={ticket.id}
            entering={FadeInUp.delay(index * 100)}
            layout={Layout.springify()}
            style={styles.ticketCard}>
            <Image
              source={{
                uri: `https://api.a0.dev/assets/image?text=event%20${ticket.event}&aspect=16:9`,
              }}
              style={styles.eventImage}
            />
            {!ticket.available && (
              <BlurView intensity={70} style={styles.soldOutOverlay}>
                <Text style={styles.soldOutText}>VENDIDO</Text>
              </BlurView>
            )}
            <View style={styles.ticketInfo}>
              <Text style={styles.eventName}>{ticket.event}</Text>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>{ticket.date}</Text>
              </View>
              <View style={styles.detailsRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Text style={styles.detailText}>{ticket.location}</Text>
              </View>
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.sellerName}>Vendedor: {ticket.seller}</Text>
                  <Text style={styles.price}>{ticket.price}€</Text>
                  <Text style={styles.commission}>+{COMMISSION_FEE}€ comisión</Text>
                </View>
                {ticket.available && (
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyTicket(ticket.id)}>
                    <Text style={styles.buyButtonText}>Comprar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </AnimatedTouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <BlurView intensity={90} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vender Entrada</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <AntDesign name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre del evento"
              value={newTicket.event}
              onChangeText={(text) => setNewTicket({ ...newTicket, event: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha (YYYY-MM-DD)"
              value={newTicket.date}
              onChangeText={(text) => setNewTicket({ ...newTicket, date: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ubicación"
              value={newTicket.location}
              onChangeText={(text) => setNewTicket({ ...newTicket, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio (€)"
              keyboardType="numeric"
              value={newTicket.price}
              onChangeText={(text) => setNewTicket({ ...newTicket, price: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={addNewTicket}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalButtonText}>Publicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  addButtonText: {
    marginLeft: 4,
    color: "white",
    fontWeight: "600",
  },
  ticketList: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: "white",
    borderRadius: 16,
    margin: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventImage: {
    width: "100%",
    height: 160,
  },
  soldOutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  soldOutText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ticketInfo: {
    padding: 16,
  },
  eventName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 15,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  sellerName: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  commission: {
    fontSize: 13,
    color: "#666",
  },
  buyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TicketSwapApp;