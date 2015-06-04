class CsgoMatchWorker
  include Sidekiq::Worker
  include Sidetiq::Schedulable

  recurrence { hourly.minute_of_hour(0,15,30,45) }

  def perform
    esp = EbotSiteParser.new
    esp.check_all_sites
  end

end