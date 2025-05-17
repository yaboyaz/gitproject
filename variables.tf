variable "resource_group_name" {}
variable "location" {}
variable "vnet_name" {}
variable "vnet_address_space" { type = list(string) }
variable "subnet_name" {}
variable "subnet_address_prefix" { type = list(string) }
variable "public_ip_count" { type = number }
variable "public_ip_name_prefix" {}
variable "public_ip_allocation_method" {}
variable "nic_name_prefix" {}
variable "vm_count" { type = number }
variable "vm_name_prefix" {}
variable "vm_size" {}
variable "admin_username" {}
variable "admin_ssh_public_key_path" {}
variable "os_disk_caching" {}
variable "os_disk_storage_account_type" {}
variable "image_publisher" {}
variable "image_offer" {}
variable "image_sku" {}
variable "image_version" {}
