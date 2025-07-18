import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "07 - API/booklogr-api",
    },
    {
      type: "category",
      label: "Books",
      items: [
        {
          type: "doc",
          id: "07 - API/get-books-in-list",
          label: "Get books in list",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "07 - API/add-book-to-list",
          label: "Add book to list",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "07 - API/remove-book-from-list",
          label: "Remove book from list",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "07 - API/edit-book",
          label: "Edit book",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "07 - API/get-notes-from-book",
          label: "Get notes from book",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "07 - API/add-note-to-book",
          label: "Add note to book",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "07 - API/check-if-book-by-isbn-is-already-in-a-list",
          label: "Check if book (by isbn) is already in a list.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Files",
      items: [
        {
          type: "doc",
          id: "07 - API/get-list-of-files",
          label: "Get list of files",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "07 - API/download-file",
          label: "Download file",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Notes",
      items: [
        {
          type: "doc",
          id: "07 - API/delete-note",
          label: "Delete note",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "07 - API/edit-note",
          label: "Edit note",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Profiles",
      items: [
        {
          type: "doc",
          id: "07 - API/get-profile-of-the-logged-in-user",
          label: "Get profile of the logged in user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "07 - API/edit-profile",
          label: "Edit profile",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "07 - API/create-profile-for-logged-in-user",
          label: "Create profile for logged in user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "07 - API/get-profile-by-name",
          label: "Get profile by name",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Tasks",
      items: [
        {
          type: "doc",
          id: "07 - API/create-task",
          label: "Create task",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "07 - API/get-tasks",
          label: "Get tasks",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "07 - API/create-task",
          label: "Create task",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
