import * as cheerio from 'cheerio';
import axios from 'axios';
import { config } from '../config.js';

const { unraid } = config;

const login = async () => {
  try {
    const loginURL = `http://${unraid.ip}/login`
    
  } catch (error) {
    console.error('ERROR - login():', error);
    throw error;
  }
}

const getVMs = async () => {
  try {
    const VMMachinesURL = `http://${unraid.ip}/plugins/dynamix.vm.manager/include/VMMachines.php`
    
    axios({
      url: VMMachinesURL,
      headers: {
        Cookie: ''
      }
    })


  } catch (error) {
    console.error('ERROR - getVMs()', error);
    throw error;
  }
}
