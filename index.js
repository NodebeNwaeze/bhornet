const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'DkmdTXc3ZCIxvHAasRIvzDBmWZT4gIpBJGT1a4hbPquYAtwIFxvzwVHp6YRlBe7y',
  APISECRET: '5sAojc4CqzjnuZKIR0BuvPkcMcRlfM1RJoe7emszHr1Sz8bIyV9QssFpFa0Dn5QV'
});
  
  var start = async function(){
  try{
   var futureprices = await binance.futuresPrices();
   var bnbusdt = futureprices.BNBUSDT;
   var spot_prices = await binance.prices('BNBUSDT');
   var spot_bnb_usdt = spot_prices.BNBUSDT; 
   console.info( spot_bnb_usdt  );
   }catch(e){
   console.log(e+" ----- erro geting BNBUSDT futures price or BNB/USDT spot price");
    }
    };
    start();