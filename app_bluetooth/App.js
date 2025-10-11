import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, PermissionsAndroid, Platform, FlatList} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

function BleScannerComponent(){
  // Variável de estado 'devices' guardará lista de dispositivos
  const [devices, setDevices] = useState([]);
  // O estado 'radioPowerOn' verifica se o bluetooth está ligado (true) ou desligado (false)
  const [radioPowerOn, setRadioPowerOn] = useState(false);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if(state === "PoweredOn"){
        setRadioPowerOn(true);
        subscription.remove();
      }
    }, true);
    
    return () => {
      subscription.remove();
      manager.destroy();
    };
  }, []);

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android'){
      // Busca saber qual API - A partir do Android 12 (API 31), as permissões explícitas do
      // bluetooth são necessárias
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      
      if (apiLevel < 31) {
        // Para android < 12, a permissão de localização é suficiente
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permissão de Localização',
            message: 'O app precisa de acesso à sua localização para escanear dispositivos bluetooth',
            buttonPositive: 'Ok'
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Caso Android 12+, deve ser solicitada as novas permissões de Bluetooth
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Permissão localização ainda necessária
        ]);
        
        return (
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED 
        );
      }
    }
    
    return true;
  };

  const scanForDevices = async () => {
    const hasPermission = await requestBluetoothPermission();
    if (!hasPermission){
      alert('Permissão negada. O aplicativo não pode escanear dispositivos Bluetooth!');
      return;
    }
    
    if(!radioPowerOn){
      alert('Por favor, ligue o Bluetooth para escanear dispositivos');
      return;
    }
    
    setDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if(error){
        console.log('ERROR SCAN: ', error);
        if (error.errorCode === 601){
          alert('Error Permissão SCAN. Verifique se a permissão de dispositivos próximos');
        }
        manager.stopDeviceScan();
        return;
      }
      
      if (device && device.name){
        setDevices(prevDevices => {
          if(!prevDevices.some(d => d.id === device.id)){
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
    
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 5000);
  };

  return(
    <View style={styles.container}>
      <Text>Dispositivos Bluetooth Encontrados: </Text>
      <Button title="Escanear Dispositivos" onPress={scanForDevices}/>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Text style={styles.deviceText}>
            {item.name || 'Dispositivo Desconhecido'} --- ({item.id})
          </Text>
        )}
      />
    </View>
  );
}

export default BleScannerComponent;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  deviceText: {fontSize: 16, padding: 10}
});