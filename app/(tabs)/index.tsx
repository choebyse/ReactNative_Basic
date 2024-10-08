import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

// WeatherForecastListItem 인터페이스 정의
interface WeatherForecastListItem {
  dt_txt: string; // 날짜와 시간 정보
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_kf: number;
    temp_max: number;
    temp_min: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  // 필요한 다른 속성도 여기에 추가
}

// WeatherForecastList 인터페이스 정의
interface WeatherForecastList {
  list: WeatherForecastListItem[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [city, setCity] = useState<string>("Loading...");
  const [days, setDays] = useState<WeatherForecastListItem[]>([]);
  const [ok, setOk] = useState<boolean>(true);

  const API_KEY = "cd92ee1a0e935e441789a36124b5bb4a";

  const icons: Record<string, string> = {
    Clouds: "cloudy",
    Clear: "day-sunny",
    Atmosphere: "cloudy-gusts",
    Snow: "snow",
    Rain: "rains",
    Drizzle: "rain",
    Thunderstorm: "lightning",
  };

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
      return; // 권한이 없을 경우 함수 종료
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );

    const cityName = location[0]?.city ?? "Unknown City";
    setCity(cityName);

    // API 호출
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { list }: WeatherForecastList = await response.json(); // 타입 어서션

    const filteredList = list.filter(({ dt_txt }: WeatherForecastListItem) =>
      dt_txt.endsWith("00:00:00")
    );
    console.log(filteredList);
    setDays(filteredList);
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.temp}>{day.main.temp.toFixed(1)}</Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="white"
                />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 58,
    fontWeight: "500",
    color: "white",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
  },
  temp: {
    marginTop: 50,
    fontWeight: "600",
    fontSize: 100,
    color: "white",
  },
  description: {
    fontSize: 50,
    color: "white",
  },
  tinyText: {
    fontSize: 20,
    color: "white",
  },
});
