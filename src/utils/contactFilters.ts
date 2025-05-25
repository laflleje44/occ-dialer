
import { Contact } from "@/types/auth";

export const filterContacts = (
  contacts: Contact[], 
  searchTerm: string, 
  filterAttending: "all" | "yes" | "no"
) => {
  return contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAttending === "all" || contact.attending === filterAttending;

    return matchesSearch && matchesFilter;
  });
};
