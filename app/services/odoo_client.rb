require 'net/http'
require 'json'

class OdooClient
  ODOO_URL = ENV.fetch("ODOO_URL")
  ODOO_DB = ENV.fetch("ODOO_DB")
  ODOO_USER = ENV.fetch("ODOO_USER")
  ODOO_PASSWORD = ENV.fetch("ODOO_PASSWORD")

  def self.authenticate
    uri = URI("#{ODOO_URL}")
    request = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        db: ODOO_DB,
        login: ODOO_USER,
        password: ODOO_PASSWORD
      }
    }

    response = post_request(uri, request)
    response["result"] if response
  end

  def self.fetch_tasks(odoo_user_id)
    uid = authenticate
    return [] unless uid

    uri = URI("#{ODOO_URL}")
    request = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "project.task",
        method: "search_read",
        args: [[["user_id", "=", odoo_user_id]]],
        kwargs: { fields: ["id", "name", "stage_id", "date_deadline"] }
      }
    }

    response = post_request(uri, request)
    response["result"] || []
  end

  private

  def self.post_request(uri, request_body)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = (uri.scheme == "https")

    request = Net::HTTP::Post.new(uri, { "Content-Type" => "application/json" })
    request.body = request_body.to_json

    response = http.request(request)
    JSON.parse(response.body) rescue nil
  end
end
