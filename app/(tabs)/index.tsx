import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";

interface ToDo {
  text: string;
  working: boolean;
}

const STORGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState<{ [key: string]: ToDo }>({});

  //App実行した時、状態を呼び出す。
  useEffect(() => {
    loadWorking();
    loadToDos();
  }, []);

  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };

  const work = () => {
    setWorking(true);
    saveWorking(true);
  };

  const onChangeText = (payload: string) => setText(payload);

  const saveToDos = async (toSave: {}) => {
    await AsyncStorage.setItem(STORGE_KEY, JSON.stringify(toSave));
  };

  const saveWorking = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  };

  const deleteToDo = (key: string) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  //　Appが実行した時、保存したデータを呼び出す。
  const loadToDos = async () => {
    const s: string | null = await AsyncStorage.getItem(STORGE_KEY);
    if (s !== null) {
      setToDos(JSON.parse(s));
    } else {
      setToDos({});
    }
  };

  //　Appが実行した時、最終のデータを呼び出す。
  const loadWorking = async () => {
    try {
      const savedWorking = await AsyncStorage.getItem(WORKING_KEY);
      if (savedWorking !== null) {
        setWorking(JSON.parse(savedWorking));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working },
    };
    console.log(newToDos);
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.grey} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 20 },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    fontSize: 18,
    marginVertical: 20,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
