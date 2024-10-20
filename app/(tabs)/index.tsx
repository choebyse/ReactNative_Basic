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
  Modal,
  Button,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import CheckBox from "react-native-check-box";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "@expo/vector-icons/Feather";
import { theme } from "./colors";

interface ToDo {
  text: string;
  working: boolean;
  isSelected: boolean;
  selectedTodo: string;
}

const STORGE_KEY = "@toDos";
const WORKING_KEY = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState<{ [key: string]: ToDo }>({});
  const [selectedTodo, setSelectedTodo] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  //App実行した時、状態を呼び出す。
  useEffect(() => {
    const fetchData = async () => {
      await loadWorking();
      await loadToDos();
    };
    fetchData();
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

  // 状態が変更になるたび、データを保存。
  const saveWorking = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  };

  // 削除
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

  //　修正
  const editToDo = (key: string) => {
    setSelectedTodo(key);
    setEditedText(toDos[key].text);
    setModalVisible(true);
  };

  const saveEditedTodo = () => {
    if (selectedTodo !== null) {
      const newToDos = {
        ...toDos,
        [selectedTodo]: { ...toDos[selectedTodo], text: editedText },
      };
      setToDos(newToDos);
      setModalVisible(false);
    }
  };

  const cancelEdit = () => {
    setModalVisible(false);
    setEditedText(""); // 입력한 내용을 초기화
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

  // 追加
  const addToDo = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Please enter a valid To Do item");
      return;
    }
    const isSelected = false;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, isSelected },
    };

    console.log(newToDos);
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  //　チェエク状態保存
  const handleCheck = (key: string) => {
    const newToDos = {
      ...toDos,
      [key]: {
        ...toDos[key],
        isSelected: !toDos[key].isSelected,
      },
    };
    console.log(newToDos);
    setToDos(newToDos);
    saveToDos(newToDos);
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
        {Object.keys(toDos)
          .filter((key) => toDos[key].working === working)
          .map((key) => (
            <View style={styles.toDo} key={key}>
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.toDoText,
                    toDos[key].isSelected ? styles.strikeThrough : null,
                  ]}
                >
                  {toDos[key].text}
                </Text>

                <TouchableOpacity
                  style={styles.editContainer}
                  onPress={() => editToDo(key)}
                >
                  <Feather name="edit" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>

              <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
              >
                <View
                  style={{
                    margin: 50,
                    padding: 40,
                    backgroundColor: "white",
                    borderRadius: 10,
                  }}
                >
                  <Text>Edit To Do</Text>
                  <TextInput
                    style={{ borderBottomWidth: 1, marginBottom: 20 }}
                    value={editedText}
                    onChangeText={setEditedText}
                  />
                  <Button title="Save" onPress={saveEditedTodo} />
                  <Button title="Cancle" onPress={cancelEdit} />
                </View>
              </Modal>

              <View style={styles.selectContainer}>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    isChecked={toDos[key].isSelected}
                    onClick={() => handleCheck(key)}
                    style={styles.checkbox}
                    checkBoxColor={theme.grey}
                  />
                </View>

                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  strikeThrough: {
    textDecorationLine: "line-through",
    textDecorationStyle: "double",
    color: "#999999",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  checkbox: {
    alignSelf: "center",
  },
  selectContainer: {
    flexDirection: "row",
  },
  textContainer: {
    flexDirection: "row",
  },
  editContainer: {
    paddingHorizontal: 10,
  },
});
