
class EbotSiteParser

  def initialize

  end

  def check_all_sites
    sites = EbotSite.all
    sites.each do |site|
      puts "Checking: #{site}"
      html = Nokogiri::HTML(open(site.url))
      parse_matches(html,site.url)
    end
  end

  private
  def parse_matches(html,site)
    html.search('//tr').each do |cell|

      create_upcoming_match(cell,site)

    end
  end

  def log_url(id,site)
    url = site.gsub(/current\/\d+/, "view/#{id}")
    return url
  end

  def id(cell)
    id = cell.css('span')[0].text
    return id.sub!('#', '').to_i
  end

  def tournament(cell)
    cell.css('td')[5].text.strip
  end

  def team_1(cell)
    match = cell.css('font')
    match[0].content.strip
  end

  def team_2(cell)
    match = cell.css('font')
    match[3].content.strip
  end

  def valid_tr(cell)
    match = cell.css('font')
    if match[0].nil? || match[3].nil?
      return false
    end
    true
  end

  def status(cell)
    cell.css('div.status').text.strip
  end

  def create_upcoming_match(cell,site)
    return unless valid_tr(cell)
    log =  log_url id(cell), site
    exists = Match.exists?(:log_path => log)
    #Check if match don't exists and status is not finsihed or not started
    if !exists && status(cell) != 'Finished' && status(cell) != 'Not started'
      match = Match.create(log_path: log,
                   team_1: team_1(cell),
                   team_2: team_2(cell),
                   tournament: tournament(cell),
                   status: 'upcoming')
      match.start_tracking
    end
  end

end