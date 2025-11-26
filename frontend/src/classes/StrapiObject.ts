import type { Router } from 'vue-router'

export class StrapiObject<T extends { documentId: string }> {
  private store: any
  private notificationStore: any
  private router: Router
  private collectionName: string
  private itemName: string

  constructor(
    store: any,
    notificationStore: any,
    router: Router,
    collectionName: string,
    itemName: string
  ) {
    this.store = store
    this.notificationStore = notificationStore
    this.router = router
    this.collectionName = collectionName
    this.itemName = itemName
  }

  /**
   * Fetches an item by ID.
   * Handles 404 by notifying and redirecting to the list.
   */
  async load(id: string): Promise<T | null> {
    const item = await this.store.get(id)
    if (item) {
      return { ...item }
    } else {
      this.notificationStore.addNotification({
        message: `${this.itemName} not found`,
        type: 'error'
      })
      this.router.push(`/${this.collectionName}`)
      return null
    }
  }

  /**
   * Saves (creates or updates) an item.
   * Handles payload preparation (stripping read-only fields), notifications, and redirection.
   */
  async save(formData: any, id?: string): Promise<T | null> {
    const payload = { ...formData }
    
    // Strip read-only fields
    delete payload.id
    delete payload.documentId
    delete payload.createdAt
    delete payload.updatedAt
    delete payload.publishedAt

    try {
      if (id) {
        await this.store.update(id, payload)
        this.notificationStore.addNotification({
          message: `${this.itemName} updated successfully`,
          type: 'success'
        })
        this.router.push(`/${this.collectionName}/${id}`)
        return null // Return value might not be needed for update as we redirect
      } else {
        const newItem = await this.store.create(payload)
        if (newItem) {
          this.notificationStore.addNotification({
            message: `${this.itemName} created successfully`,
            type: 'success'
          })
          this.router.push(`/${this.collectionName}/${newItem.documentId}`)
          return newItem
        }
      }
    } catch (error) {
      console.error(error)
      this.notificationStore.addNotification({
        message: `Error saving ${this.itemName}`,
        type: 'error'
      })
    }
    return null
  }

  /**
   * Deletes an item.
   * Handles notifications and redirection.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.store.delete(id)
      this.notificationStore.addNotification({
        message: `${this.itemName} deleted successfully`,
        type: 'success'
      })
      this.router.push(`/${this.collectionName}`)
    } catch (error) {
      console.error(error)
      this.notificationStore.addNotification({
        message: `Error deleting ${this.itemName}`,
        type: 'error'
      })
    }
  }
}
