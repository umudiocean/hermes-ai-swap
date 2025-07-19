# Hermes AI Swap - Replit AI Destek Talebi

## Proje Özeti

- React + TypeScript + Vite projesi
- Web3 entegrasyonu (ethers.js, WalletConnect, Web3Modal)
- BSC (Binance Smart Chain) ağı kullanımı
- DeFi swap uygulaması (BNB ↔ HERMES token)

## Mevcut Hatalar

### 1. RPC Hataları

```
MetaMask - RPC Error: The method "eth_maxPriorityFeePerGas" does not exist / is not available.
MetaMask - RPC Error: Internal JSON-RPC error.
Error: could not coalesce error (error={ "code": -32603, "data": { "cause": null, "code": -32000, "message": "missing trie node" }, "message": "Internal JSON-RPC error." })
```

### 2. Contract Call Hataları

```
Failed to get token balance: Error: missing revert data (action="call", data=null, reason=null, transaction={ "data": "0x70a08231000000000000000000000000f0d848b2af7db0bac9acec11bea5931e8dfd1327", "to": "0x9495aB3549338BF14aD2F86CbcF79C7b574bba37" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.15.0)
```

### 3. User Stats Hataları

```
Failed to get user stats from contract, using fallback: Error: missing revert data (action="call", data=null, reason=null, transaction={ "data": "0x4e43603a000000000000000000000000f0d848b2af7db0bac9acec11bea5931e8dfd1327", "to": "0x4140096349072a4366Fee22FaA7FB295E474eAf8" }, invocation=null, revert=null, code=CALL_EXCEPTION, version=6.15.0)
```

## Sorunların Analizi

### 1. RPC Sorunları

- MetaMask BSC ağında `eth_maxPriorityFeePerGas` metodunu desteklemiyor
- BSC RPC sunucularında "missing trie node" hatası
- RPC fallback sistemi çalışmıyor

### 2. Contract Sorunları

- Contract adresleri geçersiz: `0x9495aB3549338BF14aD2F86CbcF79C7b574bba37`
- Contract adresleri geçersiz: `0x4140096349072a4366Fee22FaA7FB295E474eAf8`
- Contract ABI'leri yanlış olabilir

### 3. Web3 Entegrasyon Sorunları

- ethers.js versiyonu uyumsuzluğu
- WalletConnect konfigürasyon sorunları
- BSC ağı geçiş sorunları

## İstenen Çözümler

### 1. RPC Sorunları İçin

- BSC için uygun RPC endpoint'leri
- `eth_maxPriorityFeePerGas` hatası için çözüm
- RPC fallback sistemi iyileştirmesi

### 2. Contract Sorunları İçin

- Doğru contract adresleri
- Contract ABI'lerinin kontrolü
- Contract call hatalarının çözümü

### 3. Web3 Entegrasyonu İçin

- ethers.js konfigürasyonu
- WalletConnect ayarları
- BSC ağı entegrasyonu

## Mevcut Dosya Yapısı

```
src/
├── lib/
│   ├── constants.ts (contract adresleri)
│   ├── web3.ts (Web3 konfigürasyonu)
│   └── statsService.ts (contract calls)
├── stores/
│   └── useWalletStore.ts (wallet management)
└── components/
    └── SwapInterface.tsx (ana swap komponenti)
```

## Öncelikli İhtiyaçlar

1. Çalışan BSC RPC endpoint'leri
2. Doğru contract adresleri ve ABI'leri
3. ethers.js konfigürasyonu
4. RPC fallback sistemi
5. Contract call hata yönetimi

## Not

- Replit'te çalışan bir sistem var, bu sistemi Cursor'a taşımak istiyoruz
- Mevcut kod yapısını koruyarak sadece hataları düzeltmek istiyoruz
- Web3 entegrasyonu ve contract etkileşimleri öncelikli
