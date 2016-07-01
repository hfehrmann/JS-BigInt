
var BigInt = function(){
	"use strict";

	var mask_16_bit = 0xFFFF;

	var block_mask = 0xFFFFFFFF;
	var block_limit_number = 0x100000000;
	
	var carry_mask = 0xFFFF0000;

	var mask_4_bit = 0xF;
	var shift_left_bits = 4;

	var trimmer = /^\u0000+(.)/;

	var bit_block_size = 32;

	function Contructor(val){
		return new BigInt(val);
	}

	function BigInt(value, sign){
		this.value = value;
		this.sign = sign == undefined ? true : sign; //false for negative
	}

	var hexTobin = {'0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
				    'a':10,'b':11,'c':12,'d':13,'e':14,'f':15,'A':10,'B':11,'C':12,'D':13,'E':14,'F':15};
	BigInt.fromHexString = function(val){
		var m = /^ *-/;
		var sign = m.test(val) ? false : true;
		var num = val.substring(2 + val.indexOf("0x")).replace(/ +/g, '').replace(/^(0x)0+/,'$1');
		var l = num.length;
		var p = 0;
		var repr = [];

		var i;
		for (i = 0; i<l; i++){
			p = (p | ( hexTobin[num.charAt(l-i-1)]<<((i%8)*4)) ) >>> 0;
			if (i % 8 == 7 ){
				repr.push(p);
				p = 0;
			}
		}
		if (i % 8 != 0 )
			repr.push(p);
		return new BigInt(repr.reverse(), sign);
	}

	BigInt.fromInteger = function(val, sign){
		var abs = Math.abs(val)
		sign = val>=0 ? true : false
		if ( (abs / (block_limit_number) ) >= 1){
			return BigInt.fromInteger(Math.floor(abs / (block_limit_number) )).concat(BigInt.fromInteger(abs % block_limit_number), sign);
		}
		else 
			return new BigInt([abs], sign);
	}

	BigInt.empty = new BigInt([]);
	BigInt.zero = BigInt.fromInteger(0);
	BigInt.one = BigInt.fromInteger(1);

	BigInt.prototype.getRepresentation = function(){
		return this.value;
	}

	BigInt.prototype.getArrayRepresentation = function(){
		return this.value.slice();
	}

	BigInt.prototype.getIndexValue = function(index){
		return this.value[index];
	}

	BigInt.prototype.length = function(){
		return this.value.length;
	}

	BigInt.prototype.subBlock = function(start, finish){ //start inclusive, finishe exclusive
		return new BigInt( this.value.slice(start, finish) );
	}

	BigInt.prototype.subBits = function(start, finish){ 
		start = start < 0 ? 0 : start
		finish = finish < 1 ? 1 : finish;
		var s_rest = start % bit_block_size ;
		var s_div =  Math.floor(start / bit_block_size);
		var f_rest = ((finish - 1)% bit_block_size) + 1 ;
		var f_div =  Math.floor(finish / bit_block_size);

		var s_block = this.getIndexValue(s_div);
		var value_minus_s_bits = (s_block <<  s_rest) >>> s_rest;

		var ret = this.subBlock(s_div+1,f_div+1).getArrayRepresentation();
		ret.splice(0,0,value_minus_s_bits);

		return new BigInt(ret).shift_right((32 - f_rest))
	}

	BigInt.prototype.concat = function(BI, sign){
		return new BigInt(this.value.concat(BI.getRepresentation()), sign);
	}

	BigInt.prototype.negate = function(){
		return new BigInt(this.value, !this.sign);
	}

	BigInt.prototype.setSign = function(sign){
		return new BigInt(this.value, sign);
	}

	BigInt.prototype.trim = function(){
		var i = 0;
		var l = this.length()
		while ((i+1)<l && this.getIndexValue(i) == 0)
			i++
		return new BigInt(this.value.slice(i,this.length()), this.sign);
	}

	BigInt.prototype.abs_cmp = function(number){
		if( this.length() > number.length())
			return 1;
		else if(this.length() == number.length()){
			var this_arr = this.getArrayRepresentation();
			var numb_arr = number.getArrayRepresentation();
			var i = 0;
			while ( (this_arr[i]-numb_arr[i])==0 && i < this_arr.length - 1)
				i++;
			return this_arr[i]-numb_arr[i];
		}
		else
			return -1;
	}

	BigInt.prototype.toBinaryString = function(){
		var l = this.length();
		var res = [];
		var par = []
		var parcial;
		for( var i = 0 ; i<this.length() ; i++){
			parcial = this.getIndexValue(l-i-1)
			for ( var j = 0; j<16; j++){
				par.push(parcial & 1)
				parcial >>= 1;
			}
			res.push(par.reverse().join(""))
			par = []
			if (parcial == 0 &&  i==this.length()-1) continue
			for ( var j = 0; j<16; j++){
				par.push(parcial & 1)
				parcial >>= 1;
			}
			res.push(par.reverse().join(""))
			par = []
		}
		return (this.sign? "+":"-") + " " + res.reverse().join("-");
	}

	var binTohex = {0:'0',1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',
				    10:'a',11:'b',12:'c',13:'d',14:'e',15:'f'};
	BigInt.prototype.toHexString = function(){
		var l = this.length();
		var res = [];
		var par = [];
		var parcial;
		for( var i = 0 ; i<l ; i++){
			parcial = this.getIndexValue(l-i-1);
			for (var j = 0; j<8; j++){
				par.push(binTohex[parcial & 0xf]);
				parcial >>>= 4;
			}
			res.push(par.reverse().join(''))
			par = []
		}
		return (this.sign? "+":"-") + " 0x" + res.reverse().join("-");
	}

	BigInt.prototype.add = function(l){
		var max, low; 
		if (this.length() > l.length()){ max = this; low = l; }
		else if (this.length() == l.length()){
			if (this.getIndexValue(0)-l.getIndexValue(0) >= 0){ max = this; low = l; }
			else { max = l; low = this; }
		}
		else{ max = l; low = this; }
		var func_application = (this.sign === l.sign) ? add : substract;
		return func_application(max,low).trim();
	}

	BigInt.prototype.substract = function(l){
		var max, low;
		var func_application = (this.sign === l.sign) ? substract : add;
		l = l.negate();
		var cmp = this.abs_cmp(l);
		if (cmp >= 0){ max = this; low = l; }
		else { max = l; low = this; }
		return func_application(max,low).trim();
	}

	function inverse_array(arr){
		return arr.reduce(function(prev, curr){return curr.concat(prev)}, BigInt.empty);
	}

	BigInt.prototype.isZero = function(){
		return this.value.length == 0 &&  this.value[0] == 0;
	}

	BigInt.prototype.paddLeftZeros = function(desire_length){
		var length = this.length()
		if (length >= desire_length)
			return this;
		else
			return addZero(desire_length-length).concat(this);
	}

	function addZero(quantity){
		var ret = []
		while (quantity-- > 0)
			ret.push(0)
		return new BigInt(ret);
	}

	function add(h, l){
		var h_l = h.length(), l_l = l.length()

		var result = []
		var curr_block;
		var carry = 0;
		var parcial;
		for(curr_block = 0; curr_block<l_l ; curr_block++){
			parcial = h.getIndexValue(h_l - curr_block - 1) + l.getIndexValue(l_l - curr_block - 1) + carry;
			carry = parcial >= block_limit_number ? 1 : 0;
			parcial >>>= 0; //for 32 bits, magic of js
			result.push(parcial);
		}
		if (curr_block < h_l){
			for( ; carry==1 && curr_block<h_l ; curr_block++){
				parcial = h.getIndexValue(h_l - curr_block - 1) + carry;
				carry = parcial >= block_limit_number ? 1 : 0;
				parcial >>>= 0; //for 32 bits, magic of js
				result.push(parcial);
			}
		}
		var middle_man = new BigInt(result.reverse());
		var head = carry == 1 ? BigInt.fromInteger(1) : h.subBlock(0, h_l - curr_block);
		return head.concat( middle_man, h.sign);
	}

	function substract(h,l){
		var h_l = h.length(), l_l = l.length()
		var result = []
		var curr_block;
		var borrow = 0;
		var parcial;
		for(curr_block = 0; curr_block<l_l ; curr_block++){
			parcial = h.getIndexValue(h_l - curr_block - 1) - borrow - l.getIndexValue(l_l - curr_block - 1) ;
			borrow = parcial < 0 ? 1 : 0;
			result.push(parcial >>>0); //for 32 bits, magic of js
		}
		if (curr_block < h_l){
			for( ; borrow==1 && curr_block<h_l ; curr_block++){
				parcial = h.getIndexValue(h_l - curr_block - 1) - borrow;
				borrow = parcial < 0 ? 1 : 0;
				result.push(parcial >>>0); //for 32 bits, magic of js
			}
		}
		var middle_man = new BigInt(result.reverse());
		var head = borrow == 1 ? BigInt.empty.negate() : h.subBlock(0, h_l - curr_block).setSign(h.sign);
		return head.concat( middle_man, head.sign);
	}

	BigInt.prototype.shift_left = function(s){
		if (this.isZero())
			return this;

		var n_l = this.length();

		var mod = s % bit_block_size;
		var div = Math.floor(s / bit_block_size);
		var carry = 0;
		var result = this.getArrayRepresentation();
		var push;
		var value_index;
		if (mod != 0){
			for (var i = 0; i < n_l; i++){
				value_index = result[n_l - i - 1];
				push = ((value_index << mod) | carry)>>>0;
				carry = value_index >>> (32-mod); //dependiente de la representacion!!
				result[n_l - i - 1] = push;
			}
		}
		if (carry > 0) result.splice(0,0,carry);
		while (div-- > 0)
			result.push(0)
		return new BigInt(result, this.sign);
	}

	BigInt.prototype.shift_right = function(s){
		if (this.isZero())
			return this;

		var n_l = this.length(); 

		var mod = s % bit_block_size;
		var div = Math.floor(s / bit_block_size);

		var result = this.getArrayRepresentation().slice(0,n_l - div);

		var carry = 0;
		var push;
		var value_index;

		if (mod != 0){
			var zero_on_right = 32 - mod;
			for (var i = 0; i < n_l - div; i++){
				value_index = result[i];
				push = ((value_index >>> mod) | carry) >>> 0;
				carry = (value_index << zero_on_right); //dependiente de la representacion!!
				result[i] = push
			}
		}
		return new BigInt(result, this.sign).trim();
	}

	BigInt.prototype.multiply = function(l){
		var h_l = this.length();
		var l_l = l.length();

		var max = (h_l >= l_l)? h_l : l_l;
		var sign = (this.sign === l.sign) ? true : false;
		return multiply(addZero(max-h_l).concat(this),addZero(max-l_l).concat(l)).setSign(sign);
	}

	var count = 0;
	function multiply(h,l){ //Karatsuba
		count++;
		var length = h.length();
		if (h.length() == 1){
			if (h.getPositionHighestBit() >= 16 && l.getPositionHighestBit() >= 16)
				return BigInt.fromInteger(h.getIndexValue(0) * l.getIndexValue(0));
			var hr = h.subBits(0,16), hl = h.subBits(16,32)
			var lr = l.subBits(0,16), ll = l.subBits(16,32)

			var upper = multiply(hr,lr)
			var sum = multiply(hl.add(hr), ll.add(lr))
			var lower = multiply(hl,ll)

			var mid = sum.substract(upper.add(lower)); 
			return upper.shift_left(32).add(mid.shift_left(16)).add(lower);
		}	
		var ceil = Math.ceil( length / 2 );
		var floor = Math.floor( length / 2 );
		var hr = h.subBlock(0,ceil), lr = l.subBlock(0,ceil);
		if (length % 2 == 0){ var hl = h.subBlock(ceil, length), ll = l.subBlock(ceil, length)}
		else { var hl = BigInt.zero.concat(h.subBlock(ceil, length)), ll = BigInt.zero.concat(l.subBlock(ceil, length))}

		var upper = multiply(hr,lr)
		var sum = multiply(hl.add(hr).paddLeftZeros(ceil), ll.add(lr).paddLeftZeros(ceil) )
		var lower = multiply(hl,ll)

		var mid = sum.substract(upper.add(lower)); 
		return upper.shift_left(64*floor).add(mid.shift_left(32*floor)).add(lower);
	}

	BigInt.prototype.getPositionHighestBit = function (){
		var v;
		var mask = 0x80000000;
		var i=0,j=0;
		outer:
		for (j = 0 ; j< this.length(); j++){
			v =	 this.getIndexValue(j);
			if (v == 0) continue;
			for (i = 0; i<bit_block_size; i++){
				if ( (mask & v) != 0 ) break outer;
				mask >>>=1;
			}
			mask = 0x80000000;
		}
		return i + j * bit_block_size;
	}

	//http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.47.565&rep=rep1&type=pdf
	BigInt.prototype.divide = function(l){ //Divede and conquer algorithm (recursive division)
		var n = l.length() * bit_block_size; 
		var sigma = n - l.getPositionHighestBit()
		var A = this.shift_left(sigma), B = l.shift_left(sigma); 
		var t = (A.getPositionHighestBit() - n - 1)
	}

	function divide(h,l){

	}

	console.log("*************++testing")
	var n1,n2;
	
	n1 = BigInt.fromHexString("0x1 00000000 00000000 ffffffff eeeeeeee")
	n2 = BigInt.one;

	console.log(n1.toHexString())
	console.log(n2.toHexString())
	console.log("multi")
	console.log(n1.multiply(n2).toHexString())
	console.log(count)


	//n1 = BigInt.fromInteger(0xeeefffffabcde);
 //    n2 = BigInt.one.negate();
 //    console.log(n1.toHexString())
	// console.log(n2.toBinaryString());
 //    console.log(n1.toBinaryString());
 //    console.log("||| "+n1.add(BigInt.one).toBinaryString());
 //    console.log("||| "+n1.substract(n2).toBinaryString());

	// n1 = BigInt.fromInteger(0x137792d04);
	// n2 = BigInt.fromInteger(-0x4e68280);
	
	// n1 = BigInt.fromInteger(0xd32f02d04);
 	// n2 = BigInt.fromInteger(0xf)

    // n1 = BigInt.fromInteger(0x32f02d0f4);
    // n2 = BigInt.fromInteger(0x1)

	// console.log(n1.toBinaryString());
	// console.log(n2.toBinaryString());
	// console.log("-------_>")
	// console.log(n1.multiply(n2).toBinaryString());
	return BigInt;
}()

module.exports = BigInt;