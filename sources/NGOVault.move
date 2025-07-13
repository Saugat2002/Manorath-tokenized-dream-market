module final_project::NGOVault;

use final_project::DreamNFT;
use sui::event;
use sui::coin::{Self, Coin};
use sui::balance::{Self, Balance};
use sui::sui::SUI;

public struct NGOVault has key {
    id: UID,
    ngo: address,
    dreamID: ID,
    matchAmount: u64,
    matchFunds: Balance<SUI>, // Store actual SUI tokens
    minMonths: u8,
    fulfilledMonths: u8,
    isActive: bool,
}

public struct MatchReleased has copy, drop {
    dreamID: ID,
    amount: u64,
    matchedBy: address,
}

public struct VaultCreated has copy, drop {
    dreamID: ID,
    ngo: address,
    id: ID,
}

public entry fun createVault(
    adminCap: &DreamNFT::AdminCap,
    dream: &mut DreamNFT::DreamNFT,
    matchAmount: u64,
    minMonths: u8,
    matchPayment: Coin<SUI>, // Require actual SUI deposit
    ctx: &mut TxContext,
) {
    // Verify the payment matches the declared amount
    assert!(coin::value(&matchPayment) == matchAmount, 0);
    
    // First approve the dream
    DreamNFT::approveDream(adminCap, dream);
    
    let vault = NGOVault {
        id: object::new(ctx),
        ngo: ctx.sender(),
        dreamID: DreamNFT::getDreamID(dream),
        matchAmount: matchAmount,
        matchFunds: coin::into_balance(matchPayment), // Store actual SUI tokens
        minMonths: minMonths,
        fulfilledMonths: 0,
        isActive: true,
    };

    // Mark the dream as having a vault
    DreamNFT::markVaultCreated(adminCap, dream);

    event::emit(VaultCreated {
        id: object::id(&vault),
        ngo: vault.ngo,
        dreamID: vault.dreamID,
    });
    
    // Make the vault a shared object so it can be accessed by multiple users
    transfer::share_object(vault);
}

public entry fun recordMonthlyContribution(vault: &mut NGOVault, dream: &DreamNFT::DreamNFT) {
    assert!(vault.isActive, 0);
    assert!(DreamNFT::getDreamID(dream) == vault.dreamID, 1);

    vault.fulfilledMonths = vault.fulfilledMonths + 1;
}

public entry fun releaseMatch(
    _: &DreamNFT::AdminCap,
    vault: &mut NGOVault,
    dream: &mut DreamNFT::DreamNFT,
    ctx: &mut TxContext,
) {
    assert!(vault.isActive, 0);
    assert!(vault.fulfilledMonths >= vault.minMonths, 1);
    assert!(vault.ngo == ctx.sender(), 2); // Only NGO can release
    assert!(DreamNFT::getDreamID(dream) == vault.dreamID, 3);

    // Transfer the actual SUI tokens to the dream
    let match_balance = balance::withdraw_all(&mut vault.matchFunds);
    DreamNFT::addMatchAmount(dream, match_balance);
    
    vault.isActive = false;

    event::emit(MatchReleased {
        dreamID: DreamNFT::getDreamID(dream),
        amount: vault.matchAmount,
        matchedBy: vault.ngo,
    });
}
