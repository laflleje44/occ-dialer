
import { useMemo } from "react";
import { Contact } from "@/types/auth";

interface UseContactFilteringProps {
  contacts: Contact[];
  selectedCallSessionId: string | null;
  searchTerm: string;
  filterAttending: "all" | "yes" | "no";
}

export const useContactFiltering = ({
  contacts,
  selectedCallSessionId,
  searchTerm,
  filterAttending
}: UseContactFilteringProps) => {
  const filteredContacts = useMemo(() => {
    // Filter contacts by selected call session
    const sessionContacts = selectedCallSessionId 
      ? contacts.filter(contact => contact.call_session_id === selectedCallSessionId)
      : contacts;

    return sessionContacts.filter(contact => {
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterAttending === "all" || contact.attending === filterAttending;

      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      // First sort by call_initiated (ascending: false comes before true)
      if (a.call_initiated !== b.call_initiated) {
        return a.call_initiated ? 1 : -1;
      }
      
      // Then sort by first name, then by last name
      const firstNameComparison = a.firstName.localeCompare(b.firstName);
      if (firstNameComparison !== 0) {
        return firstNameComparison;
      }
      return a.lastName.localeCompare(b.lastName);
    });
  }, [contacts, selectedCallSessionId, searchTerm, filterAttending]);

  return { filteredContacts };
};
