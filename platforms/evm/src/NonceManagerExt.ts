import {
  AbstractSigner,
  BlockTag,
  defineProperties,
  NonceManager,
  Provider,
  Signer,
  TransactionRequest,
  TransactionResponse,
  TypedDataDomain, TypedDataField,
} from "ethers";

/**
 *  A **NonceManager** wraps another [[Signer]] and automatically manages
 *  the nonce, ensuring serialized and sequential nonces are used during
 *  transaction.
 */
export class NonceManagerExt extends AbstractSigner {
  /**
   *  The Signer being managed.
   */
  signer!: Signer;

  #noncePromise: null | Promise<number>;
  #delta: number;

  /**
   *  Creates a new **NonceManager** to manage %%signer%%.
   */
  constructor(signer: Signer) {
    super(signer.provider);
    defineProperties<NonceManagerExt>(this, { signer });

    this.#noncePromise = null;
    this.#delta = 0;
  }

  async getAddress(): Promise<string> {
    return this.signer.getAddress();
  }

  connect(provider: null | Provider): NonceManager {
    return new NonceManager(this.signer.connect(provider));
  }

  override async getNonce(blockTag?: BlockTag): Promise<number> {
    if (!blockTag || blockTag === "pending") {
      if (this.#noncePromise == null) {
        this.#noncePromise = super.getNonce("pending");
      }

      const delta = this.#delta;
      return (await this.#noncePromise) + delta;
    }

    return super.getNonce(blockTag);
  }

  /**
   *  Manually increment the nonce. This may be useful when managng
   *  offline transactions.
   */
  increment(): void {
    this.#delta++;
  }

  /**
   *  Resets the nonce, causing the **NonceManager** to reload the current
   *  nonce from the blockchain on the next transaction.
   */
  reset(): void {
    this.#delta = 0;
    this.#noncePromise = null;
  }

  override async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const noncePromise = this.getNonce("pending");
    this.increment();

    tx = await this.signer.populateTransaction(tx);
    tx.nonce = await noncePromise;

    // @TODO: Maybe handle interesting/recoverable errors?
    // Like don't increment if the tx was certainly not sent
    return await this.signer.sendTransaction(tx);
  }

  signTransaction(tx: TransactionRequest): Promise<string> {
    this.increment();
    return this.signer.signTransaction(tx);
  }

  signMessage(message: string | Uint8Array): Promise<string> {
    return this.signer.signMessage(message);
  }

  signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>): Promise<string> {
    return this.signer.signTypedData(domain, types, value);
  }
}
