# TMS — Topic Management System

## System Overview
Facilitates creation and management of educational topics via a block-style editor, with tagging, curriculum alignment, validation workflows, accessibility, and multi-language authoring with translation linking.

## Target Users and Roles
- Creators: Author and tag topics.
- Validators: Review, edit, and approve content.
- Admins: Moderate topic libraries.
- All Users can View the Topic once content is Published


## Flows
- Author draft (block editor, media upload) → tag → submit for review → validate/edit → approve → publish.
- (Placeholder for Future Implementation) Multi-language: create base language → link translations with per-language metadata/accessibility 
- Post-publication improvements → new draft → re-approval → versioned publish (with VCS).

## High-level Features
- Block-style editor supporting multimedia using TipTap (aleady installed app/client/src/components/RichTextEditor.jsx, you can add delete modity)
- Use the simple UI for TipTap with add video, images and audio function. 
- All multimedia to be uploaded to Minio (already configured) using Pre-Signed URLs
- Tagging for classification and curriculum alignment.
- Draft, review, and publish workflows.
- Accessibility and formatting tools.

## Functional vs Non-functional Requirements
- Functional requirements
  - Topic CRUD with rich text, media, and attachments.
  - Tagging and curriculum mapping; search and filter by tags.
  - Review/approval workflow with comments and change requests.
  - Multi-language linkage and per-language metadata.
- Non-functional requirements
  - Content safety checks; accessibility validations.
  - Version history (integrates with VCS); rollback support.
  - Media optimization and size constraints for low bandwidth.
  - Editorial performance: responsive editor, draft autosave, conflict protection.

