import {
    Connection,
    PublicKey,
    sendAndConfirmTransaction,
    Signer,
    Transaction,
    TransactionSignature,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '../constants';
import { createApproveInstruction } from '../instructions';

/**
 * Grant a third-party permission to transfer up the specified number of tokens from an account
 *
 * @param account      Public key of the account
 * @param delegate     Account authorized to perform a transfer tokens from the source account
 * @param owner        Owner of the source account
 * @param multiSigners Signing accounts if `owner` is a multiSig
 * @param amount       Maximum number of tokens the delegate may transfer
 *
 * @return Signature of the confirmed transaction
 */
export async function approve(
    connection: Connection,
    payer: Signer,
    account: PublicKey,
    delegate: PublicKey,
    owner: Signer | PublicKey,
    multiSigners: Signer[],
    amount: number | bigint,
    programId = TOKEN_PROGRAM_ID
): Promise<TransactionSignature> {
    let ownerPublicKey: PublicKey;
    let signers: Signer[];
    if (owner instanceof PublicKey) {
        ownerPublicKey = owner;
        signers = multiSigners;
    } else {
        ownerPublicKey = owner.publicKey;
        signers = [owner];
    }

    const transaction = new Transaction().add(
        createApproveInstruction(account, delegate, ownerPublicKey, multiSigners, amount, programId)
    );

    return await sendAndConfirmTransaction(connection, transaction, [payer, ...signers]);
}
