import React, {useState, useEffect} from 'react'; // Foi adicionado os hooks
import {View, Text, Button, Flatlist, Stylesheet, PermissionsAndroid, Platform} from 'react-native';

const manager = new BleManager();

function BleScannerComponent(){
  // Variavel de estado 'devices' guardará lista de dispositivos
  const [devices, setDevices] = useState([]);
 // O estado 'radioPowerOn' verifica se o bluetooth está liga (true) ou desligado (false)
  const [radioPowerOn, setRadioPowerOn] = useState(false);

  useEffect( ()=> {
    const subscription = manager.onStateChange((state)=>{
      if(state == "PowerOn"){
        setRadioPowerOn(true);
        subscription.remove();
      }
    }, true)
    return () => {
      subscription.remove();
      manager.destroy();
    }
  }, [])

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android'){
    // Busca saber qual API - A partir do Ansroid 12 (API 31), as permissões explicitas do
    // bluetooth são necessárias
    const apiLevel = parseInt(Platform.Version.toString(),10);
    
    if (apiLevel <31) {
      /// Para android < 12, a permissão de localização é suficiente
      const grant = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: ' Permissão de Localização',
          message: 'O app precisa de acesso à sua localização para scannear dispositivos bluetooth',
          buttonPositive: 'Ok'
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    {
    else}
      // Caso Android 11+, deve ser solicitada as novas permissões de Bluetooth
      const result = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Permissão localização ainda necessária
        ]);
        return(
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED 
        );

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
      alert('Por favor, ligue o Bluetooth para scanear dispositivos');
      return;
    }
    setDevices([]);
    manager.startDevicesScan(null,null,(error,device) =>{
      if(error){
        console.log('ERROR SCAN: ', error)
        if (error.errorCode === 601){
          alert('Error Permissão SCAN. Verifique se a permissão de dispositivos próximos')
        }
        manager.stopDeviceScan();
        return;
      }
      if (device && devicePixelRatio.name){
        setDevices(prevDevices => {
          if(!prevDevices.some(d => d.id == devicePixelRatio.id)){
            return[...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
    setTimeout(()=>{
      manager.stopDeviceScan()},5000);
  }

}

} export default  BleScannerComponent;