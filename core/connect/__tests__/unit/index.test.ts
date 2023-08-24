import {
  TokenBridge,
  UniversalAddress,
  VAA,
} from '@wormhole-foundation/sdk-definitions';
import { Wormhole } from '../../src/wormhole';
import { MockPlatform } from '../mocks/mockPlatform';
import { MockChain } from '../mocks/mockChain';
import { Platform, RpcConnection } from '../../src';
import { PlatformName } from '@wormhole-foundation/sdk-base';

describe('Wormhole Tests', () => {
  let wh: Wormhole;
  test('Initializes Wormhole', async () => {
    wh = new Wormhole('Devnet', [MockPlatform]);
  });

  let p: MockPlatform;
  test('Returns Platform', async () => {
    p = wh.getPlatform('Ethereum');
    expect(p).toBeTruthy();
  });

  let c: MockChain;
  test('Returns chain', async () => {
    c = wh.getChain('Ethereum');
    expect(c).toBeTruthy();
  });
});

describe('Platform Tests', () => {
  const wh: Wormhole = new Wormhole('Devnet', [MockPlatform]);
  const p: Platform = wh.getPlatform('Ethereum');
  let rpc: RpcConnection;
  test('Gets RPC', () => {
    rpc = p.getProvider('Ethereum');
    expect(rpc).toBeTruthy();
  });

  let tb: TokenBridge<PlatformName>;
  test('Gets Token Bridge', async () => {
    tb = await p.getTokenBridge('Ethereum', rpc);
    expect(tb).toBeTruthy();
  });
});

describe('Chain Tests', () => {});

describe('VAA Tests', () => {
  const wh = new Wormhole('Testnet', []);

  test('GetVAA', async () => {
    const parsedVaa = await wh.getVAA(
      'Celo',
      new UniversalAddress(
        '0x00000000000000000000000005ca6037eC51F8b712eD2E6Fa72219FEaE74E153',
      ),
      469n,
    );
    expect(parsedVaa).toBeTruthy();
  });
});