
/**
 * The objective of this function is to ensure that unraid vms are always in-sync with the db
 * we will treat unraid as the source of truth
 */
export const syncUnraidVMsWithDB = async () => {
  try {
    // Get the vms from unraid
    

    // Loop through each VM and check if it is in the DB
    // if it isn't in the db then we will add it
    // if it is in the DB we should try and compare the contents of each and update


    // Compare the vms from unraid to the DB and remove any additional vms
    // We should do this as in unraid the user may have deleted a vm that has been synced
    // we should ensure the get vms worked so that we aren't deleting vms from db for no reason


    // Finally we should return the synced DB


  } catch (error) {
    console.error('ERROR - syncUnraidVMsWithDB()', error);
    throw error;
  }
}