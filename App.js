import { useState, useEffect } from "react";
import {
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Peer from "react-native-peerjs";
import axios from "axios";

function App() {
  const [peers, setPeers] = useState([]);
  const [localPeerId, setLocalPeerId] = useState();
  const [localPeer, setLocalPeer] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [otherPeerId, setOtherPeerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const sendToOtherPeer = (otherPeerId, msg) => {
    const conn = localPeer.connect(otherPeerId);

    conn.on("open", () => {
      conn.send("hi");
    });
  };

  const startConnection = (peerId) => {
    const remotePeer = localPeer.connect(peerId);
  };
  useEffect(() => {
    const localPeer = new Peer();
    setLocalPeer(localPeer);
    localPeer.on("open", (localPeerId) => {
      addPeer(localPeerId);
      setLocalPeerId(localPeerId);
    });
    //receive data
    localPeer.on("error", (e) => console.log(e));
    localPeer.on("connection", (conn) => {
      setAccepted(true);

      conn.on("open", () => {
        conn.on("data", (data) => {
          setMessages((messages) => [...messages, data]);
          console.log(messages);
        });
        console.log("open");
      });
    });
    localPeer.on("data", (data) => {
      setMessages([...messages, data]);
      Alert.alert(data);
    });
    return () => {
      axios.post("http://localhost:3000/remove_peers");
    };
  }, []);
  //home screen
  const addPeer = (id) => {
    axios
      .post("http://localhost:3000/add_peer", { peerId: id })
      .then((res) => console.log(res.data))
      .catch((e) => console.log(e));
  };

  const getPeers = () => {
    axios
      .post("http://localhost:3000/get_peers")
      .then((res) => {
        setPeers(res.data.filter((id) => id != localPeerId));
      })
      .catch((e) => console.log(e));
  };
  const Chat = () => {
    const [chatValue, setChatValue] = useState("");

    return (
      <View
        style={{
          height: "90%",
          width: "95%",
          marginTop: 10,
          borderRadius: 10,
          alignSelf: "center",
          backgroundColor: "white",
          shadowOpacity: 0.6,
          shadowColor: "#000",
          shadowRadius: 2,
          shadowOffset: {
            height: 1,
          },
        }}
      >
        {/* Chat view */}
        <View style={{ width: "100%", height: "90%" }}>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    height: 30,
                    padding: 5,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#ccc",
                  }}
                >
                  <Text>{item}</Text>
                </View>
              );
            }}
          />
        </View>
        {/* Text input view */}
        <View
          style={{
            width: "100%",
            height: "10%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <TextInput
            placeholder="Type Message"
            onChangeText={(value) => setChatValue(value)}
            style={{ width: "80%", height: "100%", padding: 10 }}
          />
          <Button
            title="send"
            onPress={() => {
              if (!chatValue) {
                Alert.alert("text field is empty");
              } else {
                const conn = localPeer.connect(otherPeerId);
                conn.on("open", () => {
                  conn.send(chatValue);
                });
              }
            }}
          />
        </View>
      </View>
    );
  };
  const HomeScreen = (props) => {
    return (
      <SafeAreaView
        style={{ flex: 1, height: "100%", backgroundColor: "#FFE5D9" }}
      >
        <StatusBar barStyle="dark-content" />
        <Button
          title={`Get Connected Peers (${peers.length})`}
          onPress={getPeers}
        />
        <View style={{ height: 50 }}>
          {peers.length > 0 && (
            <FlatList
              contentContainerStyle={{ alignItems: "center" }}
              data={peers}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => {
                return (
                  <>
                    <TouchableOpacity
                      style={styles.peer}
                      onPress={() => {
                        localPeer.connect(item);
                        setAccepted(true);
                        setOtherPeerId(item);
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  </>
                );
              }}
            />
          )}
        </View>
        <View>{accepted && <Chat />}</View>
      </SafeAreaView>
    );
  };

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Home"
          component={HomeScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  peer: {
    height: 50,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.6,
    shadowColor: "#ccc",
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
    },
  },
});

export default App;
