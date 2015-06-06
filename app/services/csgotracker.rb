require 'nokogiri'
require 'open-uri'

class Csgotracker

  def initialize(match)
    @match = match
    @last_index = -1
    @finished = false
  end

  def start_tracking
    puts "Started Tracking ::::::::::::::::::::::::::::::::::::"
    while !@finished
      track
      sleep(5.seconds)
    end
  end

  def skip_lines(line)
    return true if line == '                    </div>'
    return true if line == '</div>'
    return true if line == '<div id="logmatch">'
    return false
  end

  def track
    puts "STARTED TRACK"
    page = request_url
    index = 0
    log_v = log(page)
    puts log_v.size.inspect
    @finished = true if log_v.size == 0 #'IF NO LOG IS PRESENT, TERMINATE'
    log_v.to_s.each_line do |line|
      next if skip_lines(line)
      if index > @last_index
        puts line
        time = get_time(line)
        new_event(line,time)
        @last_index = index

      end
      index += 1
    end
  end

  def new_event(log,time)
    if win_event(log)
      @match.status = 'finished'
      @match.save!
      @finished = true;
    end
    if round_win_event(log)
      puts "#"*20
      puts log
      set_round_scores(log) 
    end
    teams_event(log)
    knife_start(log)
    admin_stop(log)
    MatchEvent.create(match: @match, log: log, log_time: time)
  end

  def knife_start(log)
    if(log =~ /INFO:.+ (Starting Knife Round)/)
      @match.status = 'started'
      @match.save!
    end
  end
  def teams_event(log)
    if(log =~ /- Teams: (.+) - ([^<>\n]+)(<br>)*/)
      @match.set_teams($1,$2)
    end
  end

  def admin_stop(log)
    if(log =~ /- Match stopped by admin/)
      @finished = true
    end
  end


  def set_round_scores(log) 
    score_reg = /- Un round a été marqué -.*\((\d+)\) - \((\d+)\)/.match(log)
    puts score_reg.inspect
    puts score_reg[0].inspect
    if(@match.team_1_score != score_reg[1].to_i)
      @match.round_win_team_1
    elsif(@match.team_2_score != score_reg[2].to_i)
      @match.round_win_team_2
    end 
  end
  def round_win_event(log)
    win_reg = /Un round a été marqué -/
    win = log.match(win_reg)
    !win.nil?
  end

  # Return true if log event is that one team has won.
  def win_event(log)
    win_reg = /win ! Final score:/
    win = log.match(win_reg)
    !win.nil?
  end

  def get_time(element)
    reg = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/
    matches = element.match(reg) 
    #return DateTime.strptime(matches[0],"%Y-%m-%d %H:%i%S") unless matches.nil?
    return matches[0].to_datetime unless matches.nil?
  end

  def log(html)
    html.css('#logmatch')
  end

  def request_url
    puts 'REQUESTING'
    return Nokogiri::HTML(open(@match.log_path))
  end

end

